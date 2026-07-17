import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Loader2, ExternalLink, Sparkles, Bookmark, BookmarkCheck, X, TrendingUp } from "lucide-react";
import { useSavedItems } from "@/hooks/useSavedItems";
import { useDismissedItems, DISMISS_REASONS, DismissReason } from "@/hooks/useDismissedItems";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
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

interface RetailerCount {
  retailer: string;
  count: number;
}

interface RejectedRetailer extends RetailerCount {
  reasons: Record<string, number>;
}

interface TasteSignal {
  savedTitles: string[];
  dismissedTitles: string[];
  lovedRetailers: RetailerCount[];
  rejectedRetailers: RejectedRetailer[];
  reasonTotals: Record<string, number>;
}

// Durable, all-time taste memory: unlike the last-20-titles window below, this scans the
// user's FULL saved/dismissed history and aggregates it by retailer, so a brand they've
// saved from 15 times keeps mattering long after those saves scroll out of any "recent"
// window. Capped at 500 rows each — plenty of headroom for a single user, cheap to fetch.
async function buildTasteSignal(userId: string): Promise<TasteSignal> {
  const [savedRes, dismissedRes, allSavedRes, allDismissedRes] = await Promise.all([
    supabase
      .from("saved_items")
      .select("title")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("rec_dismissals")
      .select("product_title")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("saved_items").select("retailer").eq("user_id", userId).limit(500),
    supabase.from("rec_dismissals").select("retailer, reason").eq("user_id", userId).limit(500),
  ]);

  const lovedCounts: Record<string, number> = {};
  for (const row of (allSavedRes.data || []) as any[]) {
    if (!row.retailer) continue;
    lovedCounts[row.retailer] = (lovedCounts[row.retailer] || 0) + 1;
  }
  const lovedRetailers = Object.entries(lovedCounts)
    .map(([retailer, count]) => ({ retailer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const rejectedCounts: Record<string, { count: number; reasons: Record<string, number> }> = {};
  const reasonTotals: Record<string, number> = {};
  for (const row of (allDismissedRes.data || []) as any[]) {
    if (row.retailer) {
      if (!rejectedCounts[row.retailer]) rejectedCounts[row.retailer] = { count: 0, reasons: {} };
      rejectedCounts[row.retailer].count += 1;
      if (row.reason) {
        rejectedCounts[row.retailer].reasons[row.reason] =
          (rejectedCounts[row.retailer].reasons[row.reason] || 0) + 1;
      }
    }
    if (row.reason) {
      reasonTotals[row.reason] = (reasonTotals[row.reason] || 0) + 1;
    }
  }
  const rejectedRetailers = Object.entries(rejectedCounts)
    .map(([retailer, v]) => ({ retailer, count: v.count, reasons: v.reasons }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  return {
    savedTitles: (savedRes.data || []).map((r: any) => r.title).filter(Boolean),
    dismissedTitles: (dismissedRes.data || []).map((r: any) => r.product_title).filter(Boolean),
    lovedRetailers,
    rejectedRetailers,
    reasonTotals,
  };
}

const ForYou = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { isSaved, toggleSave } = useSavedItems();
  const { isDismissed, dismiss } = useDismissedItems();

  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [recs, setRecs] = useState<CategoryRecs[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [styleProfile, setStyleProfile] = useState<any>(null);
  const [saveRate, setSaveRate] = useState<{ saves: number; impressions: number } | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(1000);
  const [openReasonFor, setOpenReasonFor] = useState<string | null>(null);
  // Per-retailer score used to live-rerank the current batch as the user saves/dismisses.
  // Seeded from all-time taste signal on load, then nudged in-session on every save/dismiss
  // so the grid keeps adapting without waiting for a full "Refresh."
  const [retailerAffinity, setRetailerAffinity] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadRecs();
      loadSaveRate();
      seedRetailerAffinity();
    }
  }, [user]);

  // Seeds the live re-rank score from durable taste memory, independent of whether this load
  // triggers a fresh generation — so re-ranking works even when we're just showing cached recs.
  const seedRetailerAffinity = async () => {
    if (!user) return;
    try {
      const signal = await buildTasteSignal(user.id);
      const seed: Record<string, number> = {};
      for (const r of signal.lovedRetailers) seed[r.retailer] = (seed[r.retailer] || 0) + Math.min(r.count, 3);
      for (const r of signal.rejectedRetailers)
        seed[r.retailer] = (seed[r.retailer] || 0) - Math.min(r.count, 3);
      setRetailerAffinity(seed);
    } catch (err) {
      console.error("Failed to seed retailer affinity:", err);
    }
  };

  const loadSaveRate = async () => {
    if (!user) return;
    try {
      const { count: impressions } = await supabase
        .from("rec_impressions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      const { count: saves } = await supabase
        .from("saved_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setSaveRate({ saves: saves || 0, impressions: impressions || 0 });
    } catch (err) {
      console.error("Failed to load save rate:", err);
    }
  };

  const loadRecs = async () => {
    if (!user) return;
    setLoading(true);

    try {
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

      if (profile.budget_min) setPriceMin(profile.budget_min);
      if (profile.budget_max) setPriceMax(profile.budget_max);

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
      // Pull both the recency-windowed signal (last 20 saves/dismissals) and the durable
      // all-time signal (retailer-level aggregates) to teach the model.
      const tasteSignal = await buildTasteSignal(user.id);
      const feedback = tasteSignal;
      // Re-seed the live re-rank score too, so it reflects whatever just changed.
      const seed: Record<string, number> = {};
      for (const r of tasteSignal.lovedRetailers) seed[r.retailer] = (seed[r.retailer] || 0) + Math.min(r.count, 3);
      for (const r of tasteSignal.rejectedRetailers)
        seed[r.retailer] = (seed[r.retailer] || 0) - Math.min(r.count, 3);
      setRetailerAffinity(seed);

      const { data, error } = await supabase.functions.invoke("generate-for-you-recs", {
        body: {
          styleProfile: {
            ai_keywords: p.ai_keywords,
            ai_style_brief: p.ai_style_brief,
            vibe_description: p.vibe_description,
            silhouette_type: p.silhouette_type,
            budget_min: p.budget_min,
            budget_max: p.budget_max,
            shopping_preference: p.shopping_preference,
            occasions: p.occasions,
            selected_visual_cues: p.selected_visual_cues,
          },
          feedback,
        },
      });

      if (error || !data || data.error) {
        console.error("Generation failed:", error || data?.error);
        toast.error("Could not generate picks. Try again in a moment.");
        return;
      }

      const newRecs: CategoryRecs[] = data.categories || [];
      const generationId: string = data.generationId;
      setRecs(newRecs);
      setGeneratedAt(data.generatedAt);

      await supabase
        .from("for_you_recs")
        .upsert(
          [
            {
              user_id: user.id,
              recs: { categories: newRecs } as any,
              generated_at: data.generatedAt,
            },
          ],
          { onConflict: "user_id" }
        );

      // Log impressions for save-rate tracking
      if (generationId) {
        const impressionRows = newRecs.flatMap((cat) =>
          cat.products.map((p) => ({
            user_id: user.id,
            generation_id: generationId,
            category: cat.category,
            product_link: p.link,
            product_title: p.title,
            retailer: p.retailer,
            price: p.price,
          }))
        );
        if (impressionRows.length > 0) {
          await supabase.from("rec_impressions").insert(impressionRows);
        }
      }

      const learningNote =
        feedback.savedTitles.length > 0 || feedback.dismissedTitles.length > 0
          ? ` Learning from ${feedback.savedTitles.length} saves, ${feedback.dismissedTitles.length} dismissals.`
          : "";
      toast.success(`Fresh picks ready.${learningNote}`);
      loadSaveRate();
    } catch (err) {
      console.error("generateRecs error:", err);
      toast.error("Something went wrong. Try again.");
    } finally {
      setRegenerating(false);
    }
  };

  const filteredRecs = useMemo(() => {
    const visible = selectedCategory === "All" ? recs : recs.filter((r) => r.category === selectedCategory);
    return visible.map((cat) => {
      const products = cat.products.filter(
        (p) =>
          !isDismissed(p.link) &&
          p.price !== null &&
          p.price >= priceMin &&
          p.price <= priceMax
      );
      // Live re-rank: bubble up items from retailers this user has saved from (durable
      // history + this session's actions), sink items from retailers they've dismissed.
      // Stable within a score tier so the model's own ordering is otherwise preserved.
      const ranked = products
        .map((p, idx) => ({ p, idx, score: retailerAffinity[p.retailer] || 0 }))
        .sort((a, b) => b.score - a.score || a.idx - b.idx)
        .map((r) => r.p);
      return { ...cat, products: ranked };
    });
  }, [recs, selectedCategory, priceMin, priceMax, isDismissed, retailerAffinity]);

  const totalVisible = filteredRecs.reduce((sum, c) => sum + c.products.length, 0);

  const bumpAffinity = (retailer: string, delta: number) => {
    setRetailerAffinity((prev) => ({ ...prev, [retailer]: (prev[retailer] || 0) + delta }));
  };

  // Live backfill: after a dismiss, immediately try to replace that slot with a fresh product
  // from the same category's already-vetted brand queries, so the grid stays full instead of
  // just shrinking until the next full "Refresh."
  const backfillCategory = async (cat: CategoryRecs, dismissedLink: string) => {
    const brandQueries = cat.query.split(" | ").map((q) => q.trim()).filter(Boolean);
    if (brandQueries.length === 0) return;

    const existingLinks = new Set(recs.flatMap((c) => c.products.map((prod) => prod.link)));
    existingLinks.add(dismissedLink);

    for (const q of brandQueries) {
      try {
        const { data, error } = await supabase.functions.invoke("fetch-products", {
          body: { query: q, budgetMin: priceMin, budgetMax: priceMax, limit: 6 },
        });
        if (error || !data?.products) continue;
        const fresh = (data.products as Product[]).find(
          (prod) => !existingLinks.has(prod.link) && !isDismissed(prod.link)
        );
        if (fresh) {
          setRecs((prevRecs) =>
            prevRecs.map((c) =>
              c.category === cat.category
                ? { ...c, products: [...c.products.filter((prod) => prod.link !== dismissedLink), fresh] }
                : c
            )
          );
          return;
        }
      } catch (err) {
        console.error(`Backfill failed for ${cat.category} / ${q}:`, err);
      }
    }
  };

  const handleDismiss = (cat: CategoryRecs, p: Product, reason?: DismissReason) => {
    setOpenReasonFor(null);
    dismiss({
      title: p.title,
      link: p.link,
      retailer: p.retailer,
      category: cat.category,
      reason,
    });
    bumpAffinity(p.retailer, -2);
    backfillCategory(cat, p.link);
  };

  const handleSaveToggle = (cat: CategoryRecs, p: Product) => {
    const wasSaved = isSaved(p.link);
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
    bumpAffinity(p.retailer, wasSaved ? -2 : 2);
  };

  const saveRatePct =
    saveRate && saveRate.impressions > 0
      ? Math.round((saveRate.saves / saveRate.impressions) * 100)
      : null;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-6" />
        <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-3">
          Curating your picks
        </p>
        <h2 className="text-2xl md:text-3xl font-serif font-medium text-foreground max-w-md text-center leading-tight">
          Reading your profile. Finding pieces for you.
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <header className="bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Profile
          </button>
          <span className="font-serif text-lg text-foreground">For you</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/saved")}
              className="rounded-full font-sans text-sm text-secondary hover:text-foreground gap-2"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              Shortlist
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateRecs()}
              disabled={regenerating}
              className="rounded-full font-sans text-sm gap-2"
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
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-16 py-12 max-w-6xl">
        <div className="mb-8">
          <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-3">
            Curated for you
          </p>
          <h1 className="text-3xl md:text-5xl font-serif font-medium text-foreground mb-3">
            {styleProfile?.ai_keywords && styleProfile.ai_keywords.length > 0
              ? styleProfile.ai_keywords.slice(0, 2).join(" · ")
              : "Your picks"}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {generatedAt && (
              <p className="text-xs text-muted-foreground/70 font-sans flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Last refreshed {new Date(generatedAt).toLocaleString()}
              </p>
            )}
            {saveRatePct !== null && (
              <p className="text-xs text-muted-foreground/70 font-sans flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" />
                Match rate: {saveRatePct}% ({saveRate?.saves} saves of {saveRate?.impressions} shown)
              </p>
            )}
          </div>
        </div>

        <div className="mb-10 pb-6 border-b border-border space-y-4">
          <div className="flex gap-2 flex-wrap">
            {["All", ...ALL_CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 text-sm font-sans rounded-full transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs text-muted-foreground font-sans">
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
                    <h2 className="text-2xl md:text-3xl font-serif font-medium text-foreground">{cat.category}</h2>
                    <p className="text-xs text-muted-foreground/70 font-sans">
                      {cat.products.length} {cat.products.length === 1 ? "pick" : "picks"}
                    </p>
                  </div>

                  <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory -mx-6 px-6 lg:-mx-16 lg:px-16">
                    {cat.products.map((p, i) => (
                      <a
                        key={`${cat.category}-${i}`}
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-48 md:w-56 group snap-start"
                      >
                        <div className="aspect-[3/4] bg-muted overflow-hidden relative rounded-2xl border border-border group-hover:border-primary/40 transition-colors shadow-soft">
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
                              handleSaveToggle(cat, p);
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
                          <Popover
                            open={openReasonFor === p.link}
                            onOpenChange={(open) => setOpenReasonFor(open ? p.link : null)}
                          >
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setOpenReasonFor(openReasonFor === p.link ? null : p.link);
                                }}
                                aria-label="Not for me"
                                className={`absolute bottom-2 left-2 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-sm ${
                                  openReasonFor === p.link ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-56 p-2 rounded-2xl shadow-soft-lg"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <p className="text-xs font-sans text-muted-foreground mb-2 px-1">
                                Why not this one?
                              </p>
                              <div className="flex flex-col gap-1">
                                {DISMISS_REASONS.map((r) => (
                                  <button
                                    key={r.value}
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDismiss(cat, p, r.value);
                                    }}
                                    className="text-left text-sm font-sans px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
                                  >
                                    {r.label}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDismiss(cat, p);
                                  }}
                                  className="text-left text-xs font-sans px-2 py-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors border-t border-border mt-1 pt-2"
                                >
                                  Skip, just hide it
                                </button>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="w-3.5 h-3.5 text-foreground" />
                          </div>
                        </div>
                        <div className="pt-3">
                          <p className="text-[11px] font-sans text-muted-foreground truncate">
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
                          <p className="text-[11px] font-sans text-muted-foreground/70 mt-1.5 leading-snug">
                            Why this was picked: from {p.retailer || "a brand"}, matched to your
                            style and inside your budget.
                          </p>
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
