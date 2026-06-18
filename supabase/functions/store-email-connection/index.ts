import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Exchanges a Google OAuth authorization code for tokens and stores the
// refresh token server-side so scan-email-purchases can use it later.
// This is NOT a login flow -- the user is already authenticated with Figure
// via email/password (or whatever they used). This just connects a Gmail
// account for read-only purchase scanning, scoped to the already-signed-in
// user's id.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error('Supabase credentials are not configured')
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) throw new Error('Google OAuth is not configured')

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

    const { code, redirectUri } = await req.json()
    if (!code || !redirectUri) {
      return new Response(JSON.stringify({ error: 'code and redirectUri are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error('Google token exchange failed:', tokenRes.status, errText)
      return new Response(JSON.stringify({ error: "Couldn't connect to Google. Try again." }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const tokenData = await tokenRes.json()

    if (!tokenData.refresh_token) {
      // Google only issues a refresh token on the first consent grant (or when
      // prompt=consent forces re-consent). If we land here, the user likely
      // already granted access previously without offline access being stored.
      return new Response(
        JSON.stringify({
          error:
            "Google didn't grant offline access. Open your Google Account permissions, remove Figure's access, then try connecting again.",
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let email: string | null = null
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    if (userInfoRes.ok) {
      const userInfo = await userInfoRes.json()
      email = userInfo.email ?? null
    }

    const { error: upsertError } = await supabase.from('email_connections').upsert(
      {
        user_id: user.id,
        provider: 'google',
        email_address: email,
        refresh_token: tokenData.refresh_token,
        access_token: tokenData.access_token,
        token_expires_at: new Date(Date.now() + (tokenData.expires_in ?? 3600) * 1000).toISOString(),
      },
      { onConflict: 'user_id' }
    )
    if (upsertError) throw upsertError

    return new Response(JSON.stringify({ ok: true, email }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    console.error('store-email-connection error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
