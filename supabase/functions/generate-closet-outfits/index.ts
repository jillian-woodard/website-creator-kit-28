import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OutfitItemPlan {
  name: string;
  category: string;
}

interface OutfitPlan {
  items: OutfitItemPlan[];
  stylingTip: string;
}

const stripEmDashes = (s: string) => (s || "").replace(/[—–]/g, "-");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

    const { occasion, closetItems, styleProfile } = await req.json();

    if (!closetItems || !Array.isArray(closetItems) || closetItems.length === 0) {
      return new Response(JSON.stringify({ error: "closetItems is required and must be non-empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!occasion) {
      return new Response(JSON.stringify({ error: "occasion is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const closetList = closetItems
      .map(
        (i: any) =>
          `- "${i.name}" (category: ${i.category}${i.color ? `, color: ${i.color}` : ""}${i.brand ? `, brand: ${i.brand}` : ""}${i.season && i.season.length > 0 ? `, seasons: ${i.season.join("/")}` : ""})`
      )
      .join("\n");

    const vibeDescription = styleProfile?.vibeDescription || styleProfile?.vibe_description || "";
    const keywords = styleProfile?.keywords || styleProfile?.ai_keywords || [];
    const styleBrief = styleProfile?.styleBrief || styleProfile?.ai_style_brief || "";

    const styleSummary = vibeDescription || styleBrief || keywords.length > 0
      ? `User's style profile:\nVibe: ${vibeDescription || "not specified"}\nKeywords: ${keywords.length > 0 ? keywords.join(", ") : "not specified"}\nStyle brief: ${styleBrief || "not specified"}`
      : "No style profile available; use good general styling judgment.";

    const systemPrompt = `You are a personal stylist helping a user "shop their own closet" instead of buying anything new. They want to save money, so every single item you use MUST come from the closet list they give you. Never invent new items, never suggest anything to purchase.

RULES:
- Use ONLY items from the provided closet list. Copy each item's "name" EXACTLY as given (verbatim string match) so it can be matched back to their photo.
- Build 2 to 4 distinct outfit combinations appropriate for the occasion: "${occasion}".
- Each outfit should have 2 to 5 items and should make sense together (no duplicate use of the exact same item across outfits unless the closet is very small).
- If the closet doesn't have enough variety to fully cover the occasion (e.g. no shoes, no outerwear), do NOT invent an item. Instead note the gap in a top-level "gaps" array of short strings, e.g. "No shoes in your closet yet" or "Could use one more layering piece for this occasion".
- Each outfit needs a short, concrete stylingTip (one sentence) explaining how to wear the pieces together (tucking, layering, rolling sleeves, accessory pairing, etc.) - not generic praise.
- Never use em dashes anywhere in your response.
- Do not reference body size, weight, or measurements.
- Respond with ONLY valid JSON, no preamble, no markdown, no code fences.

JSON shape:
{
  "outfits": [
    {
      "items": [ { "name": "exact closet item name", "category": "top|bottom|dress|outerwear|shoes|accessory|activewear" } ],
      "stylingTip": "one concrete sentence"
    }
  ],
  "gaps": ["short note", ...]
}

If you truly cannot build even one sensible outfit from the closet for this occasion, return an empty "outfits" array and explain why in "gaps".`;

    const userPrompt = `Occasion: ${occasion}

${styleSummary}

Closet items available (use ONLY these, copying names exactly):
${closetList}

Build 2 to 4 outfit combinations for this occasion using only the closet items above.`;

    const claudeResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!claudeResp.ok) {
      const errText = await claudeResp.text();
      console.error("Anthropic API error:", claudeResp.status, errText);
      if (claudeResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit hit. Try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Anthropic API error: ${claudeResp.status}`);
    }

    const claudeData = await claudeResp.json();
    const rawText = claudeData.content?.[0]?.text || "";
    let jsonStr = rawText.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonStr = fenceMatch[1].trim();

    const parsed: { outfits?: OutfitPlan[]; gaps?: string[] } = JSON.parse(jsonStr);

    const closetNames = new Set(closetItems.map((i: any) => i.name));

    // Defense in depth: drop any item the model invented instead of copying verbatim,
    // and strip em dashes from styling tips even though the prompt already forbids them.
    const outfits = (parsed.outfits || [])
      .map((outfit) => ({
        items: (outfit.items || []).filter((item) => closetNames.has(item.name)),
        stylingTip: stripEmDashes(outfit.stylingTip || ""),
      }))
      .filter((outfit) => outfit.items.length > 0);

    const gaps = (parsed.gaps || []).map((g) => stripEmDashes(g));

    return new Response(JSON.stringify({ outfits, gaps }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("generate-closet-outfits error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
