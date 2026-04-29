import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"];

interface Product {
  title: string;
  price: number | null;
  currency: string;
  image: string | null;
  link: string;
  retailer: string;
}

interface CategoryRecs {
  category: string;
  query: string;
  products: Product[];
}

interface FeedbackSignals {
  savedTitles?: string[];
  dismissedTitles?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Supabase credentials missing");
    }

    const { styleProfile, feedback } = await req.json();
    if (!styleProfile) {
      return new Response(JSON.stringify({ error: "styleProfile is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fb: FeedbackSignals = feedback || {};
    const savedTitles = (fb.savedTitles || []).slice(0, 20);
    const dismissedTitles = (fb.dismissedTitles || []).slice(0, 20);

    const budgetMin = styleProfile.budgetMin || styleProfile.budget_min || 50;
    const budgetMax = styleProfile.budgetMax || styleProfile.budget_max || 500;
    const keywords = styleProfile.ai_keywords || styleProfile.keywords || [];
    const styleBrief = styleProfile.ai_style_brief || styleProfile.style_brief || "";
    const vibeDescription = styleProfile.vibeDescription || styleProfile.vibe_description || "";
    const silhouetteType = styleProfile.silhouetteType || styleProfile.silhouette_type || "";
    const shoppingPreference: string =
      styleProfile.shoppingPreference || styleProfile.shopping_preference || "both";

    const genderRule = (() => {
      switch (shoppingPreference) {
        case "mens":
          return `IMPORTANT: The user shops for: mens. Every search query you generate must append "men" so results return menswear.`;
        case "womens":
          return `IMPORTANT: The user shops for: womens. Every search query you generate must append "women" so results return womenswear.`;
        case "nonbinary":
          return `IMPORTANT: The user shops for: nonbinary. Every search query you generate must append "unisex" so results return unisex pieces.`;
        default:
          return `IMPORTANT: The user shops for: both. Do NOT include gender modifiers; allow mixed results across menswear and womenswear.`;
      }
    })();

    const feedbackBlock = (savedTitles.length > 0 || dismissedTitles.length > 0)
      ? `\n\nLEARNING SIGNALS from this user's past behavior:
${savedTitles.length > 0 ? `- LOVED (saved to shortlist): ${savedTitles.slice(0, 12).join("; ")}` : ""}
${dismissedTitles.length > 0 ? `- REJECTED (dismissed as "not for me"): ${dismissedTitles.slice(0, 12).join("; ")}` : ""}

Use these signals to adjust your queries. Lean toward the colors, fabrics, silhouettes, and retailers in the LOVED list. Avoid patterns that match the REJECTED list.`
      : "";

    const systemPrompt = `You are a personal stylist translating a user's aesthetic profile into specific Google Shopping search queries, one per clothing category.

${genderRule}

For each of these categories, write ONE search query that would return products matching the user's profile:
${CATEGORIES.join(", ")}

Query rules:
- 4 to 8 words
- Specific enough to return focused results, but broad enough to return several options
- Do NOT include brand names unless the user's profile specifically calls for one
- Include color, silhouette, or texture cues drawn from the profile
- Do NOT reference body size, weight, or measurements
- Do NOT use em dashes
- Apply the gender modifier rule above to every query.

Respond with ONLY valid JSON, no preamble, no markdown, no code fences:
{
  "Tops": "query here",
  "Bottoms": "query here",
  "Dresses": "query here",
  "Outerwear": "query here",
  "Shoes": "query here",
  "Accessories": "query here"
}`;

    const userPrompt = `User's style profile:
Vibe: "${vibeDescription || "not specified"}"
Keywords: ${keywords.length > 0 ? keywords.join(", ") : "not specified"}
Style brief: "${styleBrief || "not specified"}"
${silhouetteType ? `Silhouette: ${silhouetteType}` : ""}
Budget per piece: $${budgetMin} to $${budgetMax}${feedbackBlock}

Generate one search query per category.`;

    const claudeResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 800,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!claudeResp.ok) {
      const errText = await claudeResp.text();
      console.error("Anthropic API error:", claudeResp.status, errText);
      throw new Error(`Anthropic API error: ${claudeResp.status}`);
    }

    const claudeData = await claudeResp.json();
    const rawText = claudeData.content?.[0]?.text || "";
    let jsonStr = rawText.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonStr = fenceMatch[1].trim();

    const queriesByCategory: Record<string, string> = JSON.parse(jsonStr);

    const fetchUrl = `${SUPABASE_URL}/functions/v1/fetch-products`;

    const categoryResults: CategoryRecs[] = await Promise.all(
      CATEGORIES.map(async (cat) => {
        const query = queriesByCategory[cat] || cat.toLowerCase();
        try {
          const resp = await fetch(fetchUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              query,
              budgetMin,
              budgetMax,
              limit: 8,
            }),
          });
          if (resp.ok) {
            const data = await resp.json();
            return { category: cat, query, products: data.products || [] };
          }
        } catch (err) {
          console.error(`Failed to fetch ${cat}:`, err);
        }
        return { category: cat, query, products: [] };
      })
    );

    return new Response(
      JSON.stringify({
        categories: categoryResults,
        generatedAt: new Date().toISOString(),
        generationId: crypto.randomUUID(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("generate-for-you-recs error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
