import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// A/B pairs must match ABStep.tsx. Index 0 = optionA, Index 1 = optionB.
const AB_PAIRS = [
  {
    optionA: { label: "Quiet Luxury", desc: "Understated, neutral palettes, investment pieces" },
    optionB: { label: "Bold Expression", desc: "Statement pieces, rich colors, pattern play" },
  },
  {
    optionA: { label: "Minimalist Structure", desc: "Clean lines, architectural cuts, monochrome" },
    optionB: { label: "Relaxed Flow", desc: "Soft draping, natural fabrics, effortless layers" },
  },
  {
    optionA: { label: "Classic Tailoring", desc: "Blazers, trousers, polished silhouettes" },
    optionB: { label: "Streetwear Edge", desc: "Sneakers, oversized fits, urban influence" },
  },
  {
    optionA: { label: "Warm Earth Tones", desc: "Camel, olive, terracotta, cream" },
    optionB: { label: "Cool Monochromes", desc: "Black, white, grey, navy" },
  },
  {
    optionA: { label: "Day-to-Night", desc: "Versatile pieces that transition across occasions" },
    optionB: { label: "Occasion-Specific", desc: "Distinct wardrobes for work, weekend, events" },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

    const {
      vibeDescription,
      selectedVisualCues,
      bodyInputMethod,
      silhouetteType,
      manualMeasurements,
      heightInches,
      abChoices,
      budgetMin,
      budgetMax,
    } = await req.json();

    // Resolve A/B choices to meaningful labels instead of raw 0/1 indices
    const abChoicesResolved = (abChoices || [])
      .map((choice: number, i: number) => {
        const pair = AB_PAIRS[i];
        if (!pair) return null;
        const picked = choice === 0 ? pair.optionA : pair.optionB;
        const rejected = choice === 0 ? pair.optionB : pair.optionA;
        return `Chose "${picked.label}" (${picked.desc}) over "${rejected.label}"`;
      })
      .filter(Boolean)
      .join("\n");

    const bodyContext = (() => {
      if (!bodyInputMethod) return "No body input provided.";
      const parts = [`Body input method: ${bodyInputMethod}`];
      if (silhouetteType) parts.push(`Silhouette: ${silhouetteType}`);
      if (manualMeasurements && Object.keys(manualMeasurements).length > 0) {
        parts.push(`Measurements: ${JSON.stringify(manualMeasurements)}`);
      }
      return parts.join(". ");
    })();

    const systemPrompt = `You are a personal stylist with deep taste and range. Your job is to translate a user's inputs into a defined aesthetic identity they can recognize as their own.

You must generate four outputs:

1. KEYWORDS: 3 to 5 specific aesthetic descriptors. Avoid vague or overused terms like "chic," "effortless," "timeless," or "modern classic." Be specific. Examples of good keywords: "quiet luxury," "warm minimalism," "sartorial streetwear," "elevated utility," "romantic tailoring," "editorial minimalism," "lived-in luxe," "coastal grandmother," "old money prep," "clean girl aesthetic," "Scandi-Japanese fusion."

2. SILHOUETTES: 4 to 6 specific silhouette or garment-type recommendations grounded in what will work for this person. Reference their body input if provided. Examples: "Tailored single-breasted blazers," "Wide-leg pleated trousers," "Bias-cut slip dresses," "Oversized button-down shirts," "A-line midi skirts," "Cropped leather jackets."

3. STYLE BRIEF: A short paragraph (3 to 5 sentences) written in FIRST-PERSON SINGULAR as if the user is describing themselves. The user should read it and think "yes, that's me." Do NOT use em dashes. Do NOT sound like marketing copy. Do not begin with "I am" or "My style is" — start with a more specific observation. Examples of tone:
   - "I gravitate toward quiet confidence in how I dress. Clean lines, warm neutrals, investment pieces I'll reach for again and again. I'm more interested in silhouette than trend, and I dress for the life I'm stepping into."
   - "I like clothes that look better the more I wear them. Lived-in textures, a little slouch, nothing too precious. My wardrobe does most of its work from the shoulders up and the knees down."

4. PALETTE: 4 to 6 specific color descriptors. Use concrete language like "oat," "espresso," "ink navy," "terracotta," "bone white" rather than generic words like "neutral" or "earthy."

CRITICAL RULES:
- Weight the vibe description heavily. It contains the user's intent in their own words.
- Use the A/B choices to break ties and sharpen direction. If they chose "Quiet Luxury" over "Bold Expression," reflect that.
- Use visual cues as supporting signal, not the primary driver.
- Body input shapes silhouette recommendations, nothing else. Never reference body measurements, size, or weight in keywords or the style brief.
- Never use em dashes anywhere in your output.
- Respond with ONLY valid JSON matching the exact schema below. No preamble, no markdown, no code fences.

HEIGHT: ${heightInches ? `The user is ${heightInches} inches tall.` : "Height not provided."} Use this to inform silhouette recommendations:
- Under 64 inches (5'4" and under): favor cropped, fitted, and high-waisted silhouettes; avoid oversized volume that overwhelms.
- 64 to 70 inches (5'4" to 5'10"): most silhouettes work; balance proportions thoughtfully.
- Over 70 inches (5'10" and above): favor longer hems, elongated silhouettes, and pieces that complement vertical lines.
Never reference height as a flaw or something to "compensate" for. Frame all guidance as style choices that flatter the user's frame.`;

    const userPrompt = `Generate a style profile from these inputs:

VIBE (the user's own words about what they're going for):
"${vibeDescription || "Not provided"}"

VISUAL CUES THEY RESPONDED TO:
${selectedVisualCues && selectedVisualCues.length > 0 ? selectedVisualCues.join(", ") : "None selected"}

A/B PREFERENCE CHOICES:
${abChoicesResolved || "No choices made"}

BODY INPUT:
${bodyContext}

BUDGET:
$${budgetMin || 50} to $${budgetMax || 500} per piece

Respond with ONLY this JSON structure:
{
  "keywords": ["keyword 1", "keyword 2", "keyword 3"],
  "silhouettes": ["silhouette 1", "silhouette 2", "silhouette 3", "silhouette 4"],
  "palette": ["color 1", "color 2", "color 3", "color 4"],
  "style_brief": "First-person paragraph here."
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
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

    // Clean any accidental code fences or preamble
    let jsonStr = rawText.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonStr = fenceMatch[1].trim();

    const parsed = JSON.parse(jsonStr);

    // Enforce the "no em dashes" rule as a safety net — strip any Claude missed
    const stripEmDashes = (s: string) => (s || "").replace(/—/g, ",").replace(/–/g, ",");
    const clean = {
      keywords: (parsed.keywords || []).map(stripEmDashes),
      silhouettes: (parsed.silhouettes || []).map(stripEmDashes),
      palette: (parsed.palette || []).map(stripEmDashes),
      style_brief: stripEmDashes(parsed.style_brief || ""),
    };

    return new Response(JSON.stringify(clean), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("generate-style-profile error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
