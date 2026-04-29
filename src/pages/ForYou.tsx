import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Loader2, ExternalLink, Sparkles, Bookmark, BookmarkCheck } from "lucide-react";
import { useSavedItems } from "@/hooks/useSavedItems";
import { toast } from "sonner";

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

const ALL_CATEGORIES = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"];

const ForYou = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { isSaved, toggleSave } = useSavedItems();

  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [recs, setRecs] = useState<CategoryRecs[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [styleProfile, setStyleProfile] = useState<any>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(1000);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadRecs();
  }, [user]);

  const loadRecs = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Load style profile first
      const { data: profile } = await supabase
        .from("style_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) {
        toast.error("Complete the style interview first.");
        navigate("/interview");
        return;
      }

      setStyleProfile(profile);

      // Sync price filter defaults to the user's budget
      if (profile.budget_min) setPriceMin(profile.budget_min);
      if (profile.budget_max) setPriceMax(profile.budget_max);

      // Check for cached recs
      const { data: cached } = await supabase
        .from("for_you_recs")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cached && cached.recs) {
        const parsedRecs = cached.recs as any;
        setRecs(parsedRecs.categories || []);
        setGeneratedAt(cached.generated_at);
      } else {
        // No cache, generate now
        await generateRecs(profile);
      }
    } catch (err) {
      console.error("Failed to load recs:", err);
      toast.error("Could not load recommendations");
    } finally {
      setLoading(false);
    }
  };

  const generateRecs = async (profile?: any) => {
    const p = profile || styleProfile;
    if (!p || !user) return;

    setRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-for-you-recs", {
        body: {
          styleProfile: {
            ai_keywords: p.ai_keywords,
            ai_style_brief: p.ai_style_brief,
            vibe_description: p.vibe_description,
            silhouette_type: p.silhouette_type,
            budget_min: p.budget_min,
            budget_max: p.budget_max,
          },
        },
      });

      if (error || !data || data.error) {
        console.error("Generation failed:", error || data?.error);
        toast.error("Could not generate picks. Try again in a moment.");
        return;
      }

      const newRecs = data.categories || [];
      setRecs(newRecs);
      setGeneratedAt(data.generatedAt);

      // Cache to DB
      await supabase
        .from("for_you_recs")
        .upsert(
          {
            user_id: user.id,
            recs: { categories: newRecs },
            generated_at: data.generatedAt,
          },
          { onConflict: "user_id" }
        );

      toast.success("Fresh picks ready.");
    } catch (err) {
      console.error("generateRecs error:", err);
      toast.error("Something went wrong. Try again.");
    } finally {
      setRegenerating(false);
    }
  };

  // Apply filters
  const filteredRecs = useMemo(() => {
    const visible = selectedCategory === "All" ? recs : recs.filter((r) => r.category === selectedCategory);
    return visible.map((cat) => ({
      ...cat,
      products: cat.products.filter(
        (p) => p.price !== null && p.price >= priceMin && p.price <= priceMax
      ),
    }));
  }, [recs, selectedCategory, priceMin, priceMax]);

  const totalVisible = filteredRecs.reduce((sum, c) => sum + c.products.length, 0);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-6" />
        <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-3 font-sans">
          Curating your picks
        </p>
        <h2 className="text-2xl md:text-3xl font-serif text-foreground max-w-md text-center leading-tight">
          Reading your profile. Finding pieces for you.
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Profile
          </button>
          <span className="font-serif text-lg text-foreground">For You</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateRecs()}
            disabled={regenerating}
            className="rounded-none font-sans text-xs uppercase tracking-wider gap-2"
          >
            {regenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Refreshing
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-16 py-12 max-w-6xl">
        {/* Title */}
        <div className="mb-8">
          <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-2 font-sans">
            Curated For You
          </p>
          <h1 className="text-3xl md:text-5xl font-serif text-foreground mb-3">
            {styleProfile?.ai_keywords && styleProfile.ai_keywords.length > 0
              ? styleProfile.ai_keywords.slice(0, 2).join(" · ")
              : "Your Picks"}
          </h1>
          {generatedAt && (
            <p className="text-xs text-muted-foreground/70 font-sans flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Last refreshed {new Date(generatedAt).toLocaleString()}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="mb-10 pb-6 border-b border-border space-y-4">
          {/* Category chips */}
          <div className="flex gap-2 flex-wrap">
            {["All", ...ALL_CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 text-xs font-sans uppercase tracking-wider rounded-none border transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price range */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-sans">
              Price: ${priceMin} to ${priceMax}
            </span>
            <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={priceMin}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v <= priceMax) setPriceMin(v);
                }}
                className="flex-1 accent-primary"
                aria-label="Minimum price"
              />
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={priceMax}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v >= priceMin) setPriceMax(v);
                }}
                className="flex-1 accent-primary"
                aria-label="Maximum price"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground/60 font-sans">
            {totalVisible} {totalVisible === 1 ? "piece" : "pieces"} match your filters
          </p>
        </div>

        {/* Category rows */}
        {filteredRecs.length === 0 || totalVisible === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-sans mb-2">
              No pieces match your current filters.
            </p>
            <p className="text-sm text-muted-foreground/60 font-sans">
              Try broadening your price range or category.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredRecs.map((cat) =>
              cat.products.length === 0 ? null : (
                <section key={cat.category}>
                  <div className="flex items-baseline justify-between mb-4">
                    <h2 className="text-2xl md:text-3xl font-serif text-foreground">{cat.category}</h2>
                    <p className="text-xs text-muted-foreground/70 font-sans">
                      {cat.products.length} {cat.products.length === 1 ? "pick" : "picks"}
                    </p>
                  </div>

                  {/* Horizontal scrollable strip */}
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-6 px-6 lg:-mx-16 lg:px-16">
                    {cat.products.map((p, i) => (
                      <a
                        key={`${cat.category}-${i}`}
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-48 md:w-56 group snap-start"
                      >
                        <div className="aspect-[3/4] bg-muted overflow-hidden relative border border-border group-hover:border-primary/30 transition-colors">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-sans">
                              {cat.category}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleSave({
                                title: p.title,
                                price: p.price,
                                currency: p.currency,
                                image: p.image,
                                link: p.link,
                                retailer: p.retailer,
                                category: cat.category,
                                source_query: cat.query,
                              });
                            }}
                            aria-label={isSaved(p.link) ? "Remove from shortlist" : "Save to shortlist"}
                            aria-pressed={isSaved(p.link)}
                            className="absolute top-2 left-2 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-sm"
                          >
                            {isSaved(p.link) ? (
                              <BookmarkCheck className="w-4 h-4 text-primary" fill="currentColor" />
                            ) : (
                              <Bookmark className="w-4 h-4 text-foreground" />
                            )}
                          </button>
                          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="w-3.5 h-3.5 text-foreground" />
                          </div>
                        </div>
                        <div className="pt-3">
                          <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-wider truncate">
                            {p.retailer || "Retailer"}
                          </p>
                          <p className="text-sm font-sans text-foreground leading-tight mt-0.5 line-clamp-2">
                            {p.title}
                          </p>
                          {p.price !== null && (
                            <p className="text-sm font-sans text-foreground font-medium mt-1">
                              ${p.price}
                            </p>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ForYou;
