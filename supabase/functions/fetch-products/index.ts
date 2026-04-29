import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Normalized product shape — any catalog source (SerpAPI, ShopStyle, Amazon) must return this
interface Product {
  title: string;
  price: number | null;
  currency: string;
  image: string | null;
  link: string;
  retailer: string;
}

// SerpAPI Google Shopping adapter — isolated here so swapping catalogs is one function change
async function fetchFromSerpAPI(
  query: string,
  budgetMin: number,
  budgetMax: number,
  apiKey: string,
  limit: number
): Promise<Product[]> {
  const params = new URLSearchParams({
    engine: "google_shopping",
    q: query,
    api_key: apiKey,
    num: String(limit),
    location: "United States",
    hl: "en",
    gl: "us",
  });

  const url = `https://serpapi.com/search?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errText = await response.text();
    console.error("SerpAPI error:", response.status, errText);
    throw new Error(`SerpAPI error: ${response.status}`);
  }

  const data = await response.json();
  const shoppingResults = data.shopping_results || [];

  // Normalize SerpAPI's shape into our Product shape
  const products: Product[] = shoppingResults
    .map((r: any): Product => {
      // Parse price strings like "$49.00" into numbers
      let price: number | null = null;
      if (r.extracted_price) {
        price = Number(r.extracted_price);
      } else if (typeof r.price === "string") {
        const match = r.price.match(/[\d,]+\.?\d*/);
        if (match) price = parseFloat(match[0].replace(/,/g, ""));
      }

      return {
        title: r.title || "",
        price,
        currency: "USD",
        image: r.thumbnail || null,
        link: r.product_link || r.link || "",
        retailer: r.source || "",
      };
    })
    // Only keep products with a real link, real price, and a title
    .filter((p: Product) => p.title && p.link && p.price !== null)
    // Filter to budget range
    .filter((p: Product) => p.price! >= budgetMin && p.price! <= budgetMax);

  return products;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SERPAPI_KEY = Deno.env.get("SERPAPI_KEY");
    if (!SERPAPI_KEY) throw new Error("SERPAPI_KEY is not configured");

    const { query, budgetMin = 20, budgetMax = 500, limit = 6 } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const products = await fetchFromSerpAPI(query, budgetMin, budgetMax, SERPAPI_KEY, limit);

    return new Response(JSON.stringify({ products, query, source: "serpapi" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("fetch-products error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg, products: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
