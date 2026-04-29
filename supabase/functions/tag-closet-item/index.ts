import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Must match the CATEGORIES list in Closet.tsx
const ALLOWED_CATEGORIES = ["Top", "Bottom", "Dress", "Outerwear", "Shoes", "Accessory", "Activewear"];
const ALLOWED_SEASONS = ["Spring", "Summer", "Fall", "Winter"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

    const { imageBase64, mediaType } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "imageBase64 is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a fashion stylist tagging a single clothing item from a photo for a user's digital closet. Your job is to produce accurate, useful metadata that the user can save directly or adjust with one tap.

Return only these fields:

1. name: A clear, specific 2 to 5 word item name. Examples: "Black Tailored Blazer", "Cream Crewneck Sweater", "Dark Wash Straight Jeans", "White Leather Sneakers". Be specific enough to tell this item apart from similar ones in a wardrobe. Do not include the brand in the name.

2. category: MUST be one of exactly these values: Top, Bottom, Dress, Outerwear, Shoes, Accessory, Activewear. Use Outerwear for blazers, coats, jackets. Use Accessory for bags, belts, hats, scarves, jewelry. Use Activewear only for clearly athletic items.

3. color: One or two words describing the dominant color. Use specific language when possible: "ink navy", "oat", "charcoal", "bone white", "forest green". Fall back to a plain color name if the shade is basic.

4. brand: The visible brand name if you can read a logo or tag clearly. If no brand is visible or you are not confident, return null. Never guess a brand.

5. seasons: An array of 1 to 4 seasons from exactly these values: Spring, Summer, Fall, Winter. Base this on fabric weight, sleeve length, and overall weight of the garment. A heavy wool coat is Fall and Winter. A linen shirt is Spring and Summer. Most basics work across 3 to 4 seasons.

RULES:
- Never use em dashes anywhere in your output.
- Return ONLY valid JSON, no preamble, no markdown, no code fences.
- If the image does not clearly show a single clothing item, return an error field explaining what you see.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 512,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType || "image/jpeg",
                  data: imageBase64,
                },
              },
              {
                type: "text",
                text: `Tag this clothing item and respond with ONLY this JSON structure:
{
  "name": "Item name",
  "category": "One of the allowed values",
  "color": "Color word",
  "brand": "Brand name or null",
  "seasons": ["Spring", "Fall"]
}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit hit. Try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const aiData = await response.json();
    const rawText = aiData.content?.[0]?.text || "";

    // Strip any stray code fences
    let jsonStr = rawText.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonStr = fenceMatch[1].trim();

    const parsed = JSON.parse(jsonStr);

    // If Claude decided it can't tag (not a clothing item, unclear image), pass the error through
    if (parsed.error) {
      return new Response(JSON.stringify({ error: parsed.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Safety net: validate + clean
    const stripEmDashes = (s: string) => (s || "").replace(/—/g, ",").replace(/–/g, ",");

    const normalizedCategory = ALLOWED_CATEGORIES.find(
      (c) => c.toLowerCase() === (parsed.category || "").toLowerCase()
    ) || "";

    const normalizedSeasons = (parsed.seasons || [])
      .map((s: string) => ALLOWED_SEASONS.find((a) => a.toLowerCase() === (s || "").toLowerCase()))
      .filter(Boolean);

    const clean = {
      name: stripEmDashes(parsed.name || ""),
      category: normalizedCategory,
      color: stripEmDashes(parsed.color || ""),
      brand: parsed.brand && parsed.brand !== "null" ? stripEmDashes(parsed.brand) : "",
      seasons: normalizedSeasons,
    };

    return new Response(JSON.stringify(clean), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("tag-closet-item error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
