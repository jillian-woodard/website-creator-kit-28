import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"];

interface BrandEntry {
  name: string;
  tier: string;
  aestheticTags: string[];
  men: "yes" | "no" | "limited";
  women: "yes" | "no";
  priceMin: number;
  priceMax: number;
  categories: string[];
}

// Curated brand directory (250 brands) used to ground search queries in real, taste-matched
// retailers instead of generic keyword search. Source: Fashion_Master_Brands_250_Tagged.xlsx.
// aestheticTags use Figure's own style vocabulary (Visual Cue categories and Style Words),
// so they can be matched directly against a user's selectedVisualCues and vibeDescription.
const BRAND_DIRECTORY: BrandEntry[] = [
  { name: "Revolve", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "FWRD", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Shopbop", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "SSENSE", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Farfetch", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Net-a-Porter", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "no", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "MR PORTER", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "no", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Mytheresa", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Moda Operandi", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "The RealReal", tier: "Luxury Resale", aestheticTags: ["Classic", "Polished"], men: "yes", women: "yes", priceMin: 100, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Vestiaire Collective", tier: "Luxury Resale", aestheticTags: ["Classic", "Polished"], men: "yes", women: "yes", priceMin: 100, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Fashionphile", tier: "Luxury Resale", aestheticTags: ["Classic", "Polished"], men: "yes", women: "yes", priceMin: 100, priceMax: 10000, categories: ["Accessories"] },
  { name: "Nordstrom", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Saks Fifth Avenue", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Bergdorf Goodman", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Bloomingdale's", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Neiman Marcus", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Luisaviaroma", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Cettire", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "END. Clothing", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Garmentory", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Selfridges", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Harrods", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Italist", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Goop", tier: "Multi-brand Retailer", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Zara", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "H&M", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Mango", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Uniqlo", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "COS", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "ARKET", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "& Other Stories", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Weekday", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Monki", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Massimo Dutti", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Pull&Bear", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Bershka", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Stradivarius", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Reserved", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "River Island", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Next", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Primark", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Cotton On", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Gap", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Old Navy", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Banana Republic", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "J.Crew", tier: "Fast Fashion / Mall", aestheticTags: ["Classic", "Preppy", "Classic & Tailored"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Madewell", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless", "Classic", "Streetwear & Casual"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "American Eagle", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Aerie", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Hollister", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Abercrombie & Fitch", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "PacSun", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Express", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Source Unknown", tier: "Fast Fashion / Mall", aestheticTags: ["Effortless", "Minimalist", "Streetwear & Casual"], men: "no", women: "yes", priceMin: 20, priceMax: 200, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Urban Outfitters", tier: "Fast Fashion / Mall", aestheticTags: ["Streetwear & Casual", "Eclectic", "Edgy"], men: "yes", women: "yes", priceMin: 5, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Anthropologie", tier: "Lifestyle Retailer", aestheticTags: ["Bohemian", "Eclectic", "Feminine"], men: "limited", women: "yes", priceMin: 30, priceMax: 600, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Free People", tier: "Lifestyle Retailer", aestheticTags: ["Bohemian", "Eclectic", "Feminine"], men: "limited", women: "yes", priceMin: 40, priceMax: 500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Aritzia", tier: "Contemporary", aestheticTags: ["Minimalist", "Classic & Tailored", "Effortless"], men: "no", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Reformation", tier: "Contemporary", aestheticTags: ["Feminine", "Minimalist", "Effortless"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Sézane", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Ganni", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Staud", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Khaite", tier: "Contemporary", aestheticTags: ["Minimalist", "Polished", "Edgy"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Toteme", tier: "Contemporary", aestheticTags: ["Minimalist", "Classic", "Effortless"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Anine Bing", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Veronica Beard", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Simkhai", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Frame", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Rag & Bone", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Vince", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Theory", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Rails", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "L'Agence", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Cinq à Sept", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Favorite Daughter", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Ulla Johnson", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Nili Lotan", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Alice + Olivia", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "AllSaints", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Maje", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Sandro", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "ba&sh", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Claudie Pierlot", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Club Monaco", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Everlane", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Quince", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Oak + Fort", tier: "Contemporary", aestheticTags: ["Minimalist", "Effortless"], men: "limited", women: "yes", priceMin: 20, priceMax: 350, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Tank Air", tier: "Contemporary", aestheticTags: ["Streetwear & Casual"], men: "no", women: "yes", priceMin: 45, priceMax: 300, categories: ["Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Recovered", tier: "Contemporary", aestheticTags: ["Streetwear & Casual", "Edgy"], men: "no", women: "yes", priceMin: 100, priceMax: 210, categories: ["Outerwear", "Tops"] },
  { name: "Jenni Kayne", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "no", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Frank & Eileen", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Alex Mill", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "AYR", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "The Frankie Shop", tier: "Contemporary", aestheticTags: ["Minimalist", "Classic & Tailored", "Effortless"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Joseph", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Jil Sander", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Loro Piana", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Gabriela Hearst", tier: "Contemporary", aestheticTags: ["Effortless", "Polished", "Minimalist"], men: "yes", women: "yes", priceMin: 40, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Meshki", tier: "Australian Brands", aestheticTags: ["Feminine", "Polished & Dressed Up", "Minimalist"], men: "yes", women: "yes", priceMin: 30, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Dissh", tier: "Australian Brands", aestheticTags: ["Feminine", "Effortless", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Aje", tier: "Australian Brands", aestheticTags: ["Feminine", "Effortless", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Bec + Bridge", tier: "Australian Brands", aestheticTags: ["Feminine", "Effortless", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Arcina Ori", tier: "Australian Brands", aestheticTags: ["Feminine", "Effortless", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Sonya Moda", tier: "Australian Brands", aestheticTags: ["Feminine", "Effortless", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "ACLER", tier: "Australian Brands", aestheticTags: ["Feminine", "Effortless", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Shona Joy", tier: "Australian Brands", aestheticTags: ["Feminine", "Effortless", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Camilla", tier: "Australian Brands", aestheticTags: ["Feminine", "Effortless", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Camilla and Marc", tier: "Australian Brands", aestheticTags: ["Feminine", "Effortless", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Sir.", tier: "Australian Brands", aestheticTags: ["Feminine", "Effortless", "Polished"], men: "no", women: "yes", priceMin: 30, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Hansen & Gretel", tier: "Australian Brands", aestheticTags: ["Feminine", "Effortless", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Venroy", tier: "Australian Brands", aestheticTags: ["Feminine", "Effortless", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Nude Lucy", tier: "Australian Brands", aestheticTags: ["Feminine", "Effortless", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Assembly Label", tier: "Australian Brands", aestheticTags: ["Feminine", "Effortless", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Country Road", tier: "Australian Brands", aestheticTags: ["Feminine", "Effortless", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Witchery", tier: "Australian Brands", aestheticTags: ["Feminine", "Effortless", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Seed Heritage", tier: "Australian Brands", aestheticTags: ["Feminine", "Effortless", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Forever New", tier: "Australian Brands", aestheticTags: ["Feminine", "Effortless", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Oroton", tier: "Australian Brands", aestheticTags: ["Feminine", "Effortless", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 800, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Alémais", tier: "Australian Brands", aestheticTags: ["Feminine", "Polished & Dressed Up", "Maximalist"], men: "no", women: "yes", priceMin: 150, priceMax: 900, categories: ["Bottoms", "Dresses", "Outerwear", "Tops"] },
  { name: "Rat & Boa", tier: "Occasion / Resort", aestheticTags: ["Bohemian", "Feminine", "Maximalist"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "House of CB", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Oh Polly", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Bronx and Banco", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Retrofête", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "PatBO", tier: "Occasion / Resort", aestheticTags: ["Maximalist", "Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Mirror Palais", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Lionne", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Matte Collection", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "The Attico", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Ronny Kobo", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "TOVE", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Line & Dot", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Elliatt", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Nadine Merabi", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Self-Portrait", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Significant Other", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Lovers + Friends", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "NBD", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Majorelle", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Faithfull the Brand", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Posse", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Matteau", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Agua by Agua Bendita", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Agua Bendita", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Johanna Ortiz", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Zimmermann", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Bohemian", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Rhode", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Cult Gaia", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Maximalist", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Figue", tier: "Occasion / Resort", aestheticTags: ["Feminine", "Polished & Dressed Up"], men: "limited", women: "yes", priceMin: 80, priceMax: 1500, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Nike", tier: "Activewear", aestheticTags: ["Streetwear & Casual", "Effortless"], men: "yes", women: "yes", priceMin: 20, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Adidas", tier: "Activewear", aestheticTags: ["Streetwear & Casual", "Effortless"], men: "yes", women: "yes", priceMin: 20, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Lululemon", tier: "Activewear", aestheticTags: ["Streetwear & Casual", "Effortless"], men: "yes", women: "yes", priceMin: 20, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Alo Yoga", tier: "Activewear", aestheticTags: ["Streetwear & Casual", "Effortless"], men: "yes", women: "yes", priceMin: 20, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Vuori", tier: "Activewear", aestheticTags: ["Streetwear & Casual", "Effortless"], men: "yes", women: "yes", priceMin: 20, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Athleta", tier: "Activewear", aestheticTags: ["Streetwear & Casual", "Effortless"], men: "yes", women: "yes", priceMin: 20, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Beyond Yoga", tier: "Activewear", aestheticTags: ["Streetwear & Casual", "Effortless"], men: "yes", women: "yes", priceMin: 20, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Varley", tier: "Activewear", aestheticTags: ["Streetwear & Casual", "Effortless"], men: "yes", women: "yes", priceMin: 20, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Sweaty Betty", tier: "Activewear", aestheticTags: ["Streetwear & Casual", "Effortless"], men: "yes", women: "yes", priceMin: 20, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "SET Active", tier: "Activewear", aestheticTags: ["Streetwear & Casual", "Effortless"], men: "yes", women: "yes", priceMin: 20, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "P.E Nation", tier: "Activewear", aestheticTags: ["Streetwear & Casual", "Effortless"], men: "yes", women: "yes", priceMin: 20, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Gymshark", tier: "Activewear", aestheticTags: ["Streetwear & Casual", "Effortless"], men: "yes", women: "yes", priceMin: 20, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Outdoor Voices", tier: "Activewear", aestheticTags: ["Streetwear & Casual", "Effortless"], men: "yes", women: "yes", priceMin: 20, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Fabletics", tier: "Activewear", aestheticTags: ["Streetwear & Casual", "Effortless"], men: "yes", women: "yes", priceMin: 20, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Under Armour", tier: "Activewear", aestheticTags: ["Streetwear & Casual", "Effortless"], men: "yes", women: "yes", priceMin: 20, priceMax: 300, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Levi's", tier: "Denim Specialists", aestheticTags: ["Streetwear & Casual", "Classic"], men: "yes", women: "yes", priceMin: 60, priceMax: 350, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "AGOLDE", tier: "Denim Specialists", aestheticTags: ["Streetwear & Casual", "Classic"], men: "yes", women: "yes", priceMin: 60, priceMax: 350, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Citizens of Humanity", tier: "Denim Specialists", aestheticTags: ["Streetwear & Casual", "Classic"], men: "yes", women: "yes", priceMin: 60, priceMax: 350, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Mother", tier: "Denim Specialists", aestheticTags: ["Streetwear & Casual", "Classic"], men: "yes", women: "yes", priceMin: 60, priceMax: 350, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Paige", tier: "Denim Specialists", aestheticTags: ["Streetwear & Casual", "Classic"], men: "yes", women: "yes", priceMin: 60, priceMax: 350, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "AG Jeans", tier: "Denim Specialists", aestheticTags: ["Streetwear & Casual", "Classic"], men: "yes", women: "yes", priceMin: 60, priceMax: 350, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "DL1961", tier: "Denim Specialists", aestheticTags: ["Streetwear & Casual", "Classic"], men: "yes", women: "yes", priceMin: 60, priceMax: 350, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "7 For All Mankind", tier: "Denim Specialists", aestheticTags: ["Streetwear & Casual", "Classic"], men: "yes", women: "yes", priceMin: 60, priceMax: 350, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Hudson", tier: "Denim Specialists", aestheticTags: ["Streetwear & Casual", "Classic"], men: "yes", women: "yes", priceMin: 60, priceMax: 350, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Wrangler", tier: "Denim Specialists", aestheticTags: ["Streetwear & Casual", "Classic"], men: "yes", women: "yes", priceMin: 60, priceMax: 350, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Lee", tier: "Denim Specialists", aestheticTags: ["Streetwear & Casual", "Classic"], men: "yes", women: "yes", priceMin: 60, priceMax: 350, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Joe's Jeans", tier: "Denim Specialists", aestheticTags: ["Streetwear & Casual", "Classic"], men: "yes", women: "yes", priceMin: 60, priceMax: 350, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "GRLFRND", tier: "Denim Specialists", aestheticTags: ["Streetwear & Casual", "Classic"], men: "yes", women: "yes", priceMin: 60, priceMax: 350, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Still Here", tier: "Denim Specialists", aestheticTags: ["Streetwear & Casual", "Classic"], men: "yes", women: "yes", priceMin: 60, priceMax: 350, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Re/Done", tier: "Denim Specialists", aestheticTags: ["Streetwear & Casual", "Classic"], men: "yes", women: "yes", priceMin: 60, priceMax: 350, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Hanifa", tier: "Black-owned / Black-founded", aestheticTags: ["Feminine", "Polished & Dressed Up", "Avant-Garde & Eclectic"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Kwame Adusei", tier: "Black-owned / Black-founded", aestheticTags: ["Avant-Garde & Eclectic", "Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Telfar", tier: "Black-owned / Black-founded", aestheticTags: ["Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Pyer Moss", tier: "Black-owned / Black-founded", aestheticTags: ["Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Brother Vellies", tier: "Black-owned / Black-founded", aestheticTags: ["Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Wales Bonner", tier: "Black-owned / Black-founded", aestheticTags: ["Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "House of Aama", tier: "Black-owned / Black-founded", aestheticTags: ["Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Sergio Hudson", tier: "Black-owned / Black-founded", aestheticTags: ["Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Brandon Blackwood", tier: "Black-owned / Black-founded", aestheticTags: ["Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Kai Collective", tier: "Black-owned / Black-founded", aestheticTags: ["Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Fe Noel", tier: "Black-owned / Black-founded", aestheticTags: ["Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Andrea Iyamah", tier: "Black-owned / Black-founded", aestheticTags: ["Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Maki Oh", tier: "Black-owned / Black-founded", aestheticTags: ["Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "BruceGlen", tier: "Black-owned / Black-founded", aestheticTags: ["Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Victor Glemaud", tier: "Black-owned / Black-founded", aestheticTags: ["Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Daily Paper", tier: "Black-owned / Black-founded", aestheticTags: ["Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Lemlem", tier: "Black-owned / Black-founded", aestheticTags: ["Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "The Folklore", tier: "Black-owned / Black-founded", aestheticTags: ["Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Onalaja", tier: "Black-owned / Black-founded", aestheticTags: ["Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Ndigo Studio", tier: "Black-owned / Black-founded", aestheticTags: ["Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "LaQuan Smith", tier: "Black-owned / Black-founded", aestheticTags: ["Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Diotima", tier: "Black-owned / Black-founded", aestheticTags: ["Edgy", "Polished"], men: "yes", women: "yes", priceMin: 50, priceMax: 3000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Chanel", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Dior", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Louis Vuitton", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Gucci", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Prada", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Saint Laurent", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Loewe", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Bottega Veneta", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Celine", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Valentino", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Chloé", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Givenchy", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Ferragamo", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Moncler", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Brunello Cucinelli", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Max Mara", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Burberry", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Fendi", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Miu Miu", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Dolce & Gabbana", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Balenciaga", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Alexander McQueen", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Tom Ford", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Isabel Marant", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Alaïa", tier: "Luxury Houses", aestheticTags: ["Polished & Dressed Up", "Classic", "Minimalist"], men: "yes", women: "yes", priceMin: 300, priceMax: 10000, categories: ["Accessories", "Bottoms", "Dresses", "Outerwear", "Shoes", "Tops"] },
  { name: "Kith", tier: "Streetwear / Modern", aestheticTags: ["Streetwear & Casual", "Polished"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Stüssy", tier: "Streetwear / Modern", aestheticTags: ["Streetwear & Casual", "Edgy"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Carhartt WIP", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Aimé Leon Dore", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Fear of God", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Essentials", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Noah", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Supreme", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Denim Tears", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Palm Angels", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Off-White", tier: "Streetwear / Modern", aestheticTags: ["Avant-Garde & Eclectic", "Edgy"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "A Bathing Ape", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Awake NY", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Rhude", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Gallery Dept.", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Stone Island", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "C.P. Company", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "AMI Paris", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "APC", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Tuckernuck", tier: "Retailer", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "M.M.LaFleur", tier: "Workwear", aestheticTags: ["Classic & Tailored", "Polished"], men: "no", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Buck Mason", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Marine Layer", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Good American", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "SKIMS", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Commando", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Tory Burch", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
  { name: "Reiss", tier: "Streetwear / Modern", aestheticTags: ["Effortless"], men: "yes", women: "yes", priceMin: 30, priceMax: 2500, categories: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] },
];

// Maps a style icon's id (as stored in selectedVisualCues) to the Visual Cue category it
// represents, so a user's photo picks translate into the same aesthetic vocabulary used in
// the brand directory. Source: src/lib/styleIconsData.ts. Note: the live icon set uses a
// "Red Carpet & Editorial" category that doesn't exist in the brand directory's aesthetic
// tags (that vocabulary still uses "Polished & Dressed Up" from before the rename), so those
// icons are aliased to "Polished & Dressed Up" here rather than left as a signal that could
// never match any brand.
const ICON_CATEGORY_MAP: Record<string, string> = {
  julia: "Streetwear & Casual",
  lawrence: "Streetwear & Casual",
  skylar: "Streetwear & Casual",
  carol: "Streetwear & Casual",
  jourdan: "Polished & Dressed Up",
  camila: "Polished & Dressed Up",
  chriselle: "Polished & Dressed Up",
  hannah: "Classic & Tailored",
  dani: "Classic & Tailored",
  hoangkim: "Classic & Tailored",
  aylin: "Classic & Tailored",
  maysa1: "Avant-Garde & Eclectic",
  maryann: "Avant-Garde & Eclectic",
  teaira: "Avant-Garde & Eclectic",
  aimee: "Avant-Garde & Eclectic",
};

// The fixed Style Word vocabulary a user can pick during the interview. These get folded
// into vibeDescription as a comma-joined string, so we detect them by scanning for exact
// word matches rather than expecting a separate structured field.
const STYLE_WORD_LIST = [
  "Effortless",
  "Polished",
  "Minimalist",
  "Classic",
  "Bohemian",
  "Eclectic",
  "Maximalist",
  "Preppy",
  "Feminine",
  "Edgy",
];

// Derive this user's structured style signals from their actual interview answers: the
// Visual Cue categories behind whichever icons they picked, plus any Style Words they
// selected (detected by scanning vibeDescription for exact matches). These signals are
// what we score brand aestheticTags against, so recommendations reflect real taste instead
// of just budget and gender.
function deriveStyleSignals(visualCues: string[], vibeDescription: string): string[] {
  const signals = new Set<string>();

  for (const iconId of visualCues) {
    const category = ICON_CATEGORY_MAP[iconId];
    if (category) signals.add(category);
  }

  for (const word of STYLE_WORD_LIST) {
    if (vibeDescription.toLowerCase().includes(word.toLowerCase())) {
      signals.add(word);
    }
  }

  return Array.from(signals);
}

// Condensed "most-flattering" garment silhouette guidance per body type and category, sourced
// from src/lib/bodyTypeStyling.ts (the same dataset that powers the Profile page's styling
// guide) so this logic and that guide never disagree. Only covers categories where body type
// meaningfully changes which garment shapes flatter: Shoes and Accessories are intentionally
// left out. These are garment-cut terms only (wrap, A-line, empire waist), never body
// descriptors, so they stay compatible with the "no body size in queries" rule below.
type SilhouetteBodyType = "hourglass" | "pear" | "apple" | "rectangle" | "inverted-triangle";

const SILHOUETTE_GUIDE: Record<SilhouetteBodyType, Record<string, string[]>> = {
  hourglass: {
    Tops: ["wrap top", "fitted V-neck", "fitted bodysuit"],
    Bottoms: ["high-waisted skinny jeans", "pencil skirt"],
    Dresses: ["wrap dress", "fit-and-flare dress"],
    Outerwear: ["belted trench coat", "fitted blazer"],
  },
  pear: {
    Tops: ["boat-neck top", "structured puff-sleeve blouse"],
    Bottoms: ["dark straight-leg jeans", "A-line maxi skirt", "wide-leg jeans"],
    Dresses: ["fit-and-flare dress", "empire-waist dress"],
    Outerwear: ["structured blazer", "cropped moto jacket"],
  },
  apple: {
    Tops: ["V-neck tunic", "empire-waist top"],
    Bottoms: ["straight-leg or bootcut jeans", "A-line skirt", "slim-fit trousers"],
    Dresses: ["empire-waist maxi dress", "wrap dress"],
    Outerwear: ["longline open-front cardigan", "single-breasted blazer"],
  },
  rectangle: {
    Tops: ["peplum top", "wrap or surplice top"],
    Bottoms: ["high-waisted wide-leg pants", "flared or A-line skirt", "ruched skirt"],
    Dresses: ["wrap dress", "fit-and-flare dress", "belted shirt dress"],
    Outerwear: ["belted trench coat", "cropped jacket with peplum hem"],
  },
  "inverted-triangle": {
    Tops: ["V-neck or scoop-neck fitted top", "raglan sleeve top"],
    Bottoms: ["wide-leg or palazzo pants", "full A-line skirt", "flared jeans"],
    Dresses: ["full-skirted or flared dress", "V-neck A-line dress", "tiered dress"],
    Outerwear: ["waterfall cardigan", "long-line coat with flared hem"],
  },
};

// Looks up flattering garment silhouettes for this body type and category. Returns null for
// categories with no coverage (Shoes, Accessories) or an unrecognized/empty body type (covers
// "estimated" from the photo-upload path, and users who used the manual-measurements path,
// neither of which sets a real silhouette type).
function silhouetteGuidanceForCategory(silhouetteType: string, category: string): string[] | null {
  const guide = SILHOUETTE_GUIDE[silhouetteType as SilhouetteBodyType];
  if (!guide) return null;
  return guide[category] || null;
}

// Does this brand's gender availability match the user's shopping preference?
// "both" and "nonbinary" stay permissive. We don't have a clean unisex signal in the
// source data, so excluding brands there would just shrink the pool for no real gain.
function genderMatches(brand: BrandEntry, shoppingPreference: string): boolean {
  if (shoppingPreference === "mens") return brand.men === "yes" || brand.men === "limited";
  if (shoppingPreference === "womens") return brand.women === "yes";
  return true;
}

// How many different brands each category pulls a result from. One product per brand, so
// this also caps how many items show up per category (e.g. 4 brands = 4 tops, each from a
// different retailer, instead of up to 8 tops all from one store).
const BRANDS_PER_CATEGORY = 4;

interface RetailerCount {
  retailer: string;
  count: number;
}

interface RejectedRetailer extends RetailerCount {
  reasons?: Record<string, number>;
}

// Filter the directory down to brands that plausibly fit this user, for this category:
// price range overlaps their budget, gender matches, and the brand actually sells in
// that category. A brand the user has repeatedly dismissed (or dismissed even once citing
// "don't like the brand") is excluded outright — that's a durable, all-time signal, not
// just something from the last 20 items, so it overrides aesthetic fit entirely. Among the
// rest, rank by aesthetic-tag overlap with the user's detected style signals, with a bonus
// for brands they've saved from before (also all-time), so past taste keeps compounding
// instead of resetting on every regeneration. Capped at BRANDS_PER_CATEGORY so the prompt
// stays small and readable, and so we query at most that many brands per category downstream.
function brandsForCategory(
  category: string,
  budgetMin: number,
  budgetMax: number,
  shoppingPreference: string,
  styleSignals: string[],
  lovedRetailerMap: Map<string, number>,
  rejectedRetailerMap: Map<string, RejectedRetailer>
): BrandEntry[] {
  const eligible = BRAND_DIRECTORY.filter((b) => {
    const budgetOverlaps = b.priceMin <= budgetMax && b.priceMax >= budgetMin;
    if (!budgetOverlaps) return false;
    if (!b.categories.includes(category)) return false;
    if (!genderMatches(b, shoppingPreference)) return false;

    const rejected = rejectedRetailerMap.get(b.name.toLowerCase());
    if (rejected) {
      const dislikedBrandCount = rejected.reasons?.["dislike_brand"] || 0;
      if (dislikedBrandCount >= 1 || rejected.count >= 3) return false;
    }
    return true;
  });

  const scored = eligible.map((b) => {
    const aestheticOverlap = b.aestheticTags.filter((tag) => styleSignals.includes(tag)).length;
    const lovedBonus = Math.min(lovedRetailerMap.get(b.name.toLowerCase()) || 0, 3);
    return { brand: b, score: aestheticOverlap * 2 + lovedBonus };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, BRANDS_PER_CATEGORY).map((s) => s.brand);
}

// Belt-and-suspenders guard against Google Shopping returning the wrong kind of garment for
// a category (e.g. a jacket showing up in a Tops search). Purely a title keyword check, no
// extra API calls. Deliberately conservative: only excludes on a strong signal that the
// product is a DIFFERENT category, never tries to positively confirm the category, so it
// won't zero out a category's results over an ambiguous title. Accessories is left
// unfiltered since it spans too many legitimate item types (bags, jewelry, belts, scarves)
// to build a reliable exclude list.
const CATEGORY_EXCLUDE_TERMS: Record<string, string[]> = {
  Tops: ["jean", "trouser", "legging", " pant", "pants", "skirt", "shorts", "jacket", "coat", "blazer", "dress", "gown", "jumpsuit", "romper", "boot", "sneaker", "heel", "sandal", "loafer", "flats", "necklace", "earring", "bracelet", "sunglasses", "handbag", "purse"],
  Bottoms: ["dress", "gown", "jacket", "coat", "blazer", "blouse", "tank top", "camisole", "t-shirt", "tee shirt", "boot", "sneaker", "heel", "sandal", "loafer", "flats", "necklace", "earring", "handbag", "purse"],
  Dresses: ["jean", "trouser", " pant", "pants", "jacket", "coat", "blazer", "boot", "sneaker", "sandal", "handbag", "purse", "necklace"],
  Outerwear: ["dress", "gown", "jean", "trouser", " pant", "pants", "skirt", "boot", "sneaker", "sandal", "handbag", "purse", "necklace"],
  Shoes: ["dress", "gown", "jacket", "coat", "blazer", "trouser", "jean", "skirt", "handbag", "purse", "necklace"],
  Accessories: [],
};

function passesCategoryFilter(title: string, category: string): boolean {
  const excludes = CATEGORY_EXCLUDE_TERMS[category];
  if (!excludes || excludes.length === 0) return true;
  const lower = title.toLowerCase();
  return !excludes.some((term) => lower.includes(term));
}

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
  // Durable, all-time signals (not windowed to the last 20 actions) computed client-side
  // from the user's full saved_items / rec_dismissals history. See ForYou.tsx's
  // buildTasteSignal(). Used both to bias brand selection directly and to inform the prompt.
  lovedRetailers?: RetailerCount[];
  rejectedRetailers?: RejectedRetailer[];
  reasonTotals?: Record<string, number>;
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
    const lovedRetailerMap = new Map(
      (fb.lovedRetailers || []).map((r) => [r.retailer.toLowerCase(), r.count])
    );
    const rejectedRetailerMap = new Map(
      (fb.rejectedRetailers || []).map((r) => [r.retailer.toLowerCase(), r])
    );
    const reasonTotals = fb.reasonTotals || {};

    const budgetMin = styleProfile.budgetMin || styleProfile.budget_min || 50;
    const budgetMax = styleProfile.budgetMax || styleProfile.budget_max || 500;
    const keywords = styleProfile.ai_keywords || styleProfile.keywords || [];
    const styleBrief = styleProfile.ai_style_brief || styleProfile.style_brief || "";
    const vibeDescription = styleProfile.vibeDescription || styleProfile.vibe_description || "";
    const silhouetteType = styleProfile.silhouetteType || styleProfile.silhouette_type || "";
    const shoppingPreference: string =
      styleProfile.shoppingPreference || styleProfile.shopping_preference || "both";
    const occasions: string[] =
      styleProfile.occasions || styleProfile.occasions_selected || [];
    const visualCues: string[] =
      styleProfile.selectedVisualCues || styleProfile.selected_visual_cues || [];

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

    // Derive this user's real style signals from their interview answers, then build a
    // per-category brand shortlist already filtered to their budget and gender and ranked
    // by aesthetic fit, so the model is only ever choosing among brands that actually fit.
    const styleSignals = deriveStyleSignals(visualCues, vibeDescription);
    const brandShortlists: Record<string, BrandEntry[]> = {};
    for (const cat of CATEGORIES) {
      brandShortlists[cat] = brandsForCategory(
        cat,
        budgetMin,
        budgetMax,
        shoppingPreference,
        styleSignals,
        lovedRetailerMap,
        rejectedRetailerMap
      );
    }
    const brandContextBlock = CATEGORIES.map((cat) => {
      const shortlist = brandShortlists[cat];
      if (shortlist.length === 0) {
        return `${cat}: no matching brands in the directory for this budget/gender, write a brand-agnostic query.`;
      }
      const list = shortlist
        .map((b) => `${b.name} (${b.tier}, aesthetic: ${b.aestheticTags.join("/")}, $${b.priceMin}-${b.priceMax})`)
        .join("; ");
      return `${cat}: ${list}`;
    }).join("\n");

    // Build flattering-silhouette guidance per category from the user's body type, where
    // coverage exists. Empty string (not present in the prompt at all) if there's nothing to
    // say, e.g. no silhouette type set, or it only covers Shoes/Accessories for this profile.
    const silhouetteLines = CATEGORIES
      .map((cat) => {
        const tips = silhouetteGuidanceForCategory(silhouetteType, cat);
        if (!tips || tips.length === 0) return null;
        return `${cat}: ${tips.join(", ")}`;
      })
      .filter((line): line is string => line !== null);
    const silhouetteContextBlock = silhouetteLines.join("\n");

    const REASON_LABELS: Record<string, string> = {
      too_expensive: "too expensive",
      not_my_style: "not their style",
      wrong_color: "wrong color",
      dislike_brand: "dislike the brand",
      quality: "quality looked off",
    };
    const reasonEntries = Object.entries(reasonTotals).sort((a, b) => b[1] - a[1]);
    const reasonBlock = reasonEntries.length > 0
      ? `\n- All-time dismissal reasons: ${reasonEntries.map(([r, c]) => `${REASON_LABELS[r] || r} (${c}x)`).join(", ")}. If "too expensive" is common, lean toward the lower half of their budget rather than the upper half. If "not their style" or "wrong color" are common, favor safer, closer-to-brief interpretations over experimental ones.`
      : "";
    const durableNote = (lovedRetailerMap.size > 0 || rejectedRetailerMap.size > 0)
      ? ` Durable, all-time taste memory (not just this recent list) has already been used to bias the BRAND SHORTLIST above toward brands this user saves from and to exclude ones they've repeatedly dismissed or dismissed as "dislike_brand" — trust that shortlist's ordering rather than re-deriving it.`
      : "";

    const feedbackBlock = (savedTitles.length > 0 || dismissedTitles.length > 0 || reasonEntries.length > 0)
      ? `\n\nLEARNING SIGNALS from this user's past behavior:
${savedTitles.length > 0 ? `- LOVED (saved to shortlist): ${savedTitles.slice(0, 12).join("; ")}` : ""}
${dismissedTitles.length > 0 ? `- REJECTED (dismissed as "not for me"): ${dismissedTitles.slice(0, 12).join("; ")}` : ""}${reasonBlock}

Use these signals to adjust your queries. Lean toward the colors, fabrics, silhouettes, and retailers in the LOVED list. Avoid patterns that match the REJECTED list.${durableNote}`
      : "";

    const systemPrompt = `You are a personal stylist translating a user's aesthetic profile into specific Google Shopping search queries, one per clothing category.

${genderRule}

For each of these categories, write ONE search query that would return products matching the user's profile:
${CATEGORIES.join(", ")}

BRAND SHORTLIST: for each category, you are given a shortlist of real brands already filtered to this user's budget and shopping preference, and ranked by how closely their aesthetic tags match this user's detected style signals (${styleSignals.length > 0 ? styleSignals.join(", ") : "none detected, rank on the keywords and style brief below instead"}):
${brandContextBlock}
${silhouetteContextBlock ? `
SILHOUETTE GUIDANCE: for the categories below, these garment cuts tend to be flattering for this user's body type. Where one fits naturally alongside the brand and aesthetic you've already chosen, work it into the query as a garment style, not as a comment on the body itself:
${silhouetteContextBlock}
` : ""}
Query rules:
- For EACH category, write ONE query PER BRAND listed in that category's shortlist above, not one query for the whole category. If a category's shortlist has 4 brands, that category needs 4 separate queries, each for a different brand, so the results end up coming from 4 different retailers instead of one retailer dominating the category.
- Only write a single brand-agnostic query for a category if its shortlist above says there are no matching brands. Otherwise every query must have a brand.
- Never invent a brand name that isn't in the shortlist provided for that category.
- Each query is 4 to 8 words, and must lead with the exact brand name it's for (e.g. "Reformation floral wrap dress" rather than "floral wrap dress").
- Specific enough to return focused results for that ONE category, but broad enough to return several options. Do not let a Tops query drift into pants/jackets/dresses phrasing, a Bottoms query drift into tops/outerwear phrasing, etc. — keep each query unambiguously about its own category's garment type.
- Include color, silhouette, or texture cues drawn from the profile in addition to the brand name. Where silhouette guidance is given above for a category, you may name a specific flattering garment cut, like wrap, A-line, or empire waist, as part of the query.
- Do NOT reference body size, weight, measurements, or the body type itself (e.g. never write "hourglass" or "pear shaped" in a query). Silhouette guidance should only ever surface as a garment cut term, never as a body descriptor.
- Do NOT use em dashes
- Apply the gender modifier rule above to every query.
- Ground queries in the occasions the user actually selected. If "Workwear" is not among their occasions, do not default to office or corporate styling, even as a "safe" choice. If they selected things like "Everyday," "Going Out," or "Loungewear," queries should reflect that instead.
- If a named style cue or look is provided, let it meaningfully shape silhouette and styling choices in the queries, not just generic keywords.

Respond with ONLY valid JSON, no preamble, no markdown, no code fences. For each category, return an array with one {"brand": ..., "query": ...} object per brand in that category's shortlist (brand should be null only for the rare brand-agnostic case):
{
  "Tops": [{"brand": "Brand Name", "query": "query here"}, ...],
  "Bottoms": [{"brand": "Brand Name", "query": "query here"}, ...],
  "Dresses": [{"brand": "Brand Name", "query": "query here"}, ...],
  "Outerwear": [{"brand": "Brand Name", "query": "query here"}, ...],
  "Shoes": [{"brand": "Brand Name", "query": "query here"}, ...],
  "Accessories": [{"brand": "Brand Name", "query": "query here"}, ...]
}`;

    const userPrompt = `User's style profile:
Vibe: "${vibeDescription || "not specified"}"
Keywords: ${keywords.length > 0 ? keywords.join(", ") : "not specified"}
Style brief: "${styleBrief || "not specified"}"
${silhouetteType ? `Silhouette: ${silhouetteType}` : ""}
Budget per piece: $${budgetMin} to $${budgetMax}
Occasions they dress for: ${occasions.length > 0 ? occasions.join(", ") : "not specified"}
Style cues / reference looks they responded to: ${visualCues.length > 0 ? visualCues.join(", ") : "not specified"}${feedbackBlock}

Generate one search query per brand in each category's shortlist, as instructed.`;

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

    interface BrandQuery {
      brand: string | null;
      query: string;
    }

    const queriesByCategory: Record<string, BrandQuery[]> = JSON.parse(jsonStr);

    const fetchUrl = `${SUPABASE_URL}/functions/v1/fetch-products`;

    // For each category, run one query PER BRAND in parallel, and keep only the top
    // (post-filter) result from each — so a category's results are diversified across up
    // to BRANDS_PER_CATEGORY different retailers instead of one retailer dominating it.
    const categoryResults: CategoryRecs[] = await Promise.all(
      CATEGORIES.map(async (cat) => {
        const rawQueries = queriesByCategory[cat];
        const brandQueries: BrandQuery[] =
          Array.isArray(rawQueries) && rawQueries.length > 0
            ? rawQueries
            : [{ brand: null, query: cat.toLowerCase() }];

        const perBrandResults = await Promise.all(
          brandQueries.map(async (bq): Promise<Product | null> => {
            try {
              const resp = await fetch(fetchUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                  query: bq.query,
                  budgetMin,
                  budgetMax,
                  limit: 4,
                }),
              });
              if (resp.ok) {
                const data = await resp.json();
                const candidates: Product[] = data.products || [];
                // Prefer the top result that actually looks like this category; fall back
                // to the raw top result rather than dropping the brand entirely.
                const filtered = candidates.filter((p) => passesCategoryFilter(p.title, cat));
                return filtered[0] || candidates[0] || null;
              }
            } catch (err) {
              console.error(`Failed to fetch ${cat} / ${bq.brand ?? "brand-agnostic"}:`, err);
            }
            return null;
          })
        );

        const products = perBrandResults.filter((p): p is Product => p !== null);
        const queryDisplay = brandQueries.map((bq) => bq.query).join(" | ");
        return { category: cat, query: queryDisplay, products };
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
