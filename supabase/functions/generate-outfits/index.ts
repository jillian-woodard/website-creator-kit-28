import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Product {
  title: string;
  price: number | null;
  currency: string;
  image: string | null;
  link: string;
  retailer: string;
}

interface OutfitItemPlan {
  name: string;
  category: string;
  fromCloset: boolean;
  searchQuery?: string; // only for non-closet items
  broadSearchQuery?: string; // simpler fallback query, only for non-closet items
}

interface OutfitPlan {
  items: OutfitItemPlan[];
  stylingTip: string;
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

    const { days, closetItems, styleProfile } = await req.json();

    if (!days || !Array.isArray(days) || days.length === 0) {
      return new Response(JSON.stringify({ error: "days array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const closetSummary =
      closetItems && closetItems.length > 0
        ? `The user owns these items:\n${closetItems
            .map(
              (i: any) =>
                `- ${i.name} (${i.category}${i.color ? ", " + i.color : ""}${i.brand ? ", " + i.brand : ""})`
            )
            .join("\n")}`
        : "The user has no items in their closet yet.";

    const styleSummary = styleProfile
      ? `Style profile: ${styleProfile.vibeDescription || "not specified"}. Keywords: ${(styleProfile.keywords || []).join(", ") || "none"}. Budget: $${styleProfile.budgetMin || 50} to $${styleProfile.budgetMax || 500} per piece.`
      : "No style profile available, suggest versatile classic pieces.";

    // Silhouette-based guidance, style-framed not body-framed
    const silhouetteGuidance = (() => {
      const silhouette = styleProfile?.silhouetteType;
      if (!silhouette) return "";
      return `\nSILHOUETTE CONTEXT: The user's silhouette is ${silhouette}. Favor cuts and shapes that read well on this silhouette. Never describe body parts, weight, or size in the stylingTip or item descriptions. Frame everything as style choices, not body corrections.`;
    })();

    const daysList = days
      .map(
        (d: any) =>
          `${d.dayName} (${d.date}): ${d.tempHigh}°F/${d.tempLow}°F, ${d.condition}, occasion: ${d.occasion}`
      )
      .join("\n");

    const budgetMin = styleProfile?.budgetMin || 50;
    const budgetMax = styleProfile?.budgetMax || 500;

    // STEP 1: Ask Claude to plan the outfits as searchable query strings
    const planningPrompt = `You are a personal stylist generating outfit plans for a week.

${styleSummary}${silhouetteGuidance}

${closetSummary}

Your job: for each day, compose an outfit of 3 to 5 items. For each item, decide whether to use something from the user's closet (fromCloset: true) or recommend a new piece to buy (fromCloset: false).

For NEW items to buy, do NOT invent brand names or product names. Instead, write a searchQuery that describes what to buy in 4 to 8 words, specific enough to return good Google Shopping results. Examples of good search queries:
- "cream oversized wool blazer women"
- "dark wash high waisted straight jeans"
- "black leather loafers women minimalist"
- "ivory silk slip midi dress"

Also write a broadSearchQuery: a simpler, more generic 2 to 4 word version of the same item (drop color/fit/material qualifiers, keep just the core item type and gender), used as a fallback if the specific search comes up empty. Examples:
- searchQuery "cream oversized wool blazer women" -> broadSearchQuery "women's blazer"
- searchQuery "dark wash high waisted straight jeans" -> broadSearchQuery "women's jeans"
- searchQuery "black leather loafers women minimalist" -> broadSearchQuery "women's loafers"

Do NOT include brand names in either query unless the user's profile specifically signals a brand. Let the catalog search surface the best options.

RULES:
- Prioritize closet items when possible
- Weather and occasion should drive the outfit
- Budget per new piece: $${budgetMin} to $${budgetMax}
- Never use em dashes anywhere
- Respond with ONLY valid JSON, no preamble, no markdown, no code fences

JSON shape:
{
  "outfits": [
    {
      "items": [
        { "name": "Item name from closet OR descriptive name for new items", "category": "top|bottom|dress|outerwear|shoes|accessory", "fromCloset": true }
      ],
      "stylingTip": "one brief styling note"
    }
  ]
}

For items where fromCloset is false, also include a searchQuery field and a broadSearchQuery field.

The outfits array must have exactly ${days.length} entries, one per day in order.`;

    const planResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 2048,
        system: planningPrompt,
        messages: [
          { role: "user", content: `Plan outfits for this week:\n${daysList}` },
        ],
      }),
    });

    if (!planResponse.ok) {
      const errText = await planResponse.text();
      console.error("Anthropic API error:", planResponse.status, errText);
      if (planResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit hit. Try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Anthropic API error: ${planResponse.status}`);
    }

    const planData = await planResponse.json();
    const rawText = planData.content?.[0]?.text || "";

    let jsonStr = rawText.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonStr = fenceMatch[1].trim();

    const plan: { outfits: OutfitPlan[] } = JSON.parse(jsonStr);

    // STEP 2: Collect all unique search queries from non-closet items.
    // We collect both the specific searchQuery and the broader fallback broadSearchQuery so
    // we can retry with a wider net when the specific query comes up empty, instead of going
    // straight to a generic Google Shopping search link.
    const queriesToFetch = new Set<string>();
    for (const outfit of plan.outfits) {
      for (const item of outfit.items) {
        if (!item.fromCloset) {
          if (item.searchQuery) queriesToFetch.add(item.searchQuery);
          if (item.broadSearchQuery) queriesToFetch.add(item.broadSearchQuery);
        }
      }
    }

    // STEP 3: Fetch real products for each unique query in parallel
    // Call our own fetch-products function via Supabase's functions endpoint
    const fetchProductsUrl = `${SUPABASE_URL}/functions/v1/fetch-products`;

    const productLookup = new Map<string, Product[]>();
    await Promise.all(
      Array.from(queriesToFetch).map(async (query) => {
        try {
          const resp = await fetch(fetchProductsUrl, {
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
            productLookup.set(query, data.products || []);
          } else {
            productLookup.set(query, []);
          }
        } catch (err) {
          console.error(`Failed to fetch products for "${query}":`, err);
          productLookup.set(query, []);
        }
      })
    );

    // STEP 4: Merge real products into the outfit plan
    // For each non-closet item, pick the first real product (best match) and fall back to a
    // Google Shopping search URL if nothing came back.
    const enrichedOutfits = plan.outfits.map((outfit) => ({
      ...outfit,
      items: outfit.items.map((item) => {
        if (item.fromCloset) {
          return {
            name: item.name,
            category: item.category,
            fromCloset: true,
          };
        }

        const query = item.searchQuery || item.name;
        const specificProducts = productLookup.get(query) || [];
        const broadQuery = item.broadSearchQuery;
        const broadProducts = broadQuery ? productLookup.get(broadQuery) || [] : [];

        // Prefer the specific query's results; retry with the broader query if the specific
        // one came up empty rather than dropping straight to a search-page fallback link.
        const products = specificProducts.length > 0 ? specificProducts : broadProducts;
        const top = products[0];

        if (top) {
          // We have a real product. Surface up to 3 real shop links (top match plus
          // alternatives) so the UI isn't limited to a single retailer per item.
          const linkCandidates = products.slice(0, 4);
          const retailerLinks = linkCandidates
            .filter((p) => p.link)
            .slice(0, 3)
            .map((p) => ({
              name: p.retailer || "Shop",
              url: p.link,
            }));

          return {
            name: top.title,
            category: item.category,
            fromCloset: false,
            brand: top.retailer,
            estimatedPrice: top.price,
            image: top.image,
            searchUrl: top.link, // direct link to the product (kept as a single-link fallback)
            retailer: top.retailer,
            retailerLinks,
            alternatives: products.slice(1, 4).map((p) => ({
              name: p.title,
              price: p.price,
              image: p.image,
              link: p.link,
              retailer: p.retailer,
            })),
          };
        }

        // Fallback: neither the specific nor the broad query found a real product, point to
        // a Google Shopping search using whichever query is more likely to return results.
        const fallbackQuery = broadQuery || query;
        const fallbackUrl = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(fallbackQuery)}&tbs=mr:1,price:1,ppr_min:${budgetMin},ppr_max:${budgetMax}`;
        return {
          name: item.name,
          category: item.category,
          fromCloset: false,
          estimatedPrice: null,
          searchUrl: fallbackUrl,
          retailer: "Google Shopping",
          isFallback: true,
        };
      }),
    }));

    return new Response(JSON.stringify({ outfits: enrichedOutfits }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("generate-outfits error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
