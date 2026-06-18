import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Scans a user's connected Gmail inbox for likely clothing purchase
// confirmations, runs each candidate through Claude to extract structured
// item details, and inserts results into detected_purchases as status
// "pending" for the user to review before anything touches their closet.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const MAX_CANDIDATES = 15
const ALLOWED_CATEGORIES = ['Top', 'Bottom', 'Dress', 'Outerwear', 'Shoes', 'Accessory', 'Activewear']

function base64UrlDecode(data: string): string {
  const padded = data.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder('utf-8').decode(bytes)
}

function extractBodyText(payload: any): string {
  if (!payload) return ''
  if (payload.body?.data && typeof payload.mimeType === 'string' && payload.mimeType.startsWith('text/')) {
    try {
      return base64UrlDecode(payload.body.data)
    } catch {
      return ''
    }
  }
  if (Array.isArray(payload.parts)) {
    const plain = payload.parts.find((p: any) => p.mimeType === 'text/plain' && p.body?.data)
    if (plain) {
      try {
        return base64UrlDecode(plain.body.data)
      } catch {
        /* fall through */
      }
    }
    for (const part of payload.parts) {
      const nested = extractBodyText(part)
      if (nested) return nested
    }
  }
  return ''
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')
    const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error('Supabase credentials are not configured')
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) throw new Error('Google OAuth is not configured')
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not configured')

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: connection, error: connErr } = await supabase
      .from('email_connections')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    if (connErr) throw connErr
    if (!connection) {
      return new Response(JSON.stringify({ error: 'No email connected yet' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Refresh the access token if it's missing or about to expire
    let accessToken: string | null = connection.access_token
    const expiresAt = connection.token_expires_at ? new Date(connection.token_expires_at).getTime() : 0
    if (!accessToken || expiresAt - Date.now() < 60_000) {
      const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: connection.refresh_token,
          grant_type: 'refresh_token',
        }),
      })
      if (!refreshRes.ok) {
        const errText = await refreshRes.text()
        console.error('Google token refresh failed:', refreshRes.status, errText)
        return new Response(
          JSON.stringify({ error: 'Your Gmail connection needs to be reconnected.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const refreshed = await refreshRes.json()
      accessToken = refreshed.access_token
      await supabase
        .from('email_connections')
        .update({
          access_token: accessToken,
          token_expires_at: new Date(Date.now() + (refreshed.expires_in ?? 3600) * 1000).toISOString(),
        })
        .eq('id', connection.id)
    }

    // Search for likely purchase receipts/confirmations from the last 6 months
    const query =
      'newer_than:180d (subject:(order OR receipt OR purchase OR shipped OR "order confirmation" OR "thank you for your order")) -subject:(newsletter OR unsubscribe)'
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${MAX_CANDIDATES}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    if (!listRes.ok) {
      const errText = await listRes.text()
      console.error('Gmail list failed:', listRes.status, errText)
      throw new Error("Couldn't search Gmail")
    }
    const listData = await listRes.json()
    const messageIds: string[] = (listData.messages || []).map((m: any) => m.id)

    if (messageIds.length === 0) {
      await supabase.from('email_connections').update({ last_synced_at: new Date().toISOString() }).eq('id', connection.id)
      return new Response(JSON.stringify({ scanned: 0, found: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Don't re-process messages we've already scanned for this user
    const { data: existing } = await supabase
      .from('detected_purchases')
      .select('gmail_message_id')
      .eq('user_id', user.id)
      .in('gmail_message_id', messageIds)
    const seen = new Set((existing || []).map((r: any) => r.gmail_message_id))
    const newIds = messageIds.filter((id) => !seen.has(id))

    const stripEmDashes = (s: string) => (s || '').replace(/—/g, ',').replace(/–/g, ',')

    let found = 0
    for (const id of newIds) {
      try {
        const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (!msgRes.ok) continue
        const msg = await msgRes.json()

        const headers = msg.payload?.headers || []
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || ''
        const from = headers.find((h: any) => h.name === 'From')?.value || ''
        const dateHeader = headers.find((h: any) => h.name === 'Date')?.value || ''

        const rawBody = extractBodyText(msg.payload)
        const body = stripHtml(rawBody).slice(0, 4000)
        const snippet = msg.snippet || ''

        const systemPrompt = `You determine whether an email is a confirmation of a completed clothing, footwear, or accessory purchase (an order confirmation, receipt, or shipping notice), and if so extract structured details. Be conservative: newsletters, promotions, restock alerts, cart-abandonment nudges, and anything that isn't clearly a completed purchase should be marked false.

Respond with ONLY valid JSON, no markdown, no preamble:
{
  "isClothingPurchase": boolean,
  "merchant": "string or null",
  "itemName": "string or null, e.g. 'Wool Crewneck Sweater'",
  "brand": "string or null",
  "category": "one of Top, Bottom, Dress, Outerwear, Shoes, Accessory, Activewear, or null if unclear",
  "color": "string or null",
  "price": number or null,
  "currency": "3-letter code or null",
  "purchaseDate": "YYYY-MM-DD or null"
}

Never use em dashes anywhere in your output. If the order has multiple items, pick the single most prominent or expensive clothing item.`

        const userContent = `From: ${from}\nSubject: ${subject}\nDate: ${dateHeader}\nSnippet: ${snippet}\nBody (truncated):\n${body}`

        const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5',
            max_tokens: 400,
            system: systemPrompt,
            messages: [{ role: 'user', content: userContent }],
          }),
        })

        if (!aiRes.ok) {
          console.error('Anthropic error for message', id, aiRes.status)
          continue
        }

        const aiData = await aiRes.json()
        let raw = (aiData.content?.[0]?.text || '').trim()
        const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
        if (fence) raw = fence[1].trim()

        let parsed: any
        try {
          parsed = JSON.parse(raw)
        } catch {
          continue
        }

        if (!parsed.isClothingPurchase) continue

        const normalizedCategory =
          ALLOWED_CATEGORIES.find((c) => c.toLowerCase() === (parsed.category || '').toLowerCase()) || null

        const { error: insertErr } = await supabase.from('detected_purchases').insert({
          user_id: user.id,
          email_connection_id: connection.id,
          gmail_message_id: id,
          merchant: parsed.merchant ? stripEmDashes(parsed.merchant) : null,
          item_name: parsed.itemName ? stripEmDashes(parsed.itemName) : subject || 'Detected item',
          brand: parsed.brand ? stripEmDashes(parsed.brand) : null,
          category: normalizedCategory,
          color: parsed.color ? stripEmDashes(parsed.color) : null,
          price: typeof parsed.price === 'number' ? parsed.price : null,
          currency: parsed.currency || 'USD',
          purchase_date: parsed.purchaseDate || null,
          raw_subject: subject,
          status: 'pending',
        })

        if (insertErr) {
          if (insertErr.code !== '23505') console.error('Insert detected_purchase failed:', insertErr)
        } else {
          found++
        }
      } catch (innerErr) {
        console.error('Error processing message', id, innerErr)
        continue
      }
    }

    await supabase.from('email_connections').update({ last_synced_at: new Date().toISOString() }).eq('id', connection.id)

    return new Response(JSON.stringify({ scanned: newIds.length, found }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    console.error('scan-email-purchases error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
