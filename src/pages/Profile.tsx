import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStyle } from "@/lib/styleContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Shirt, CalendarDays, AlertTriangle, Loader2, ExternalLink, Sparkles, ArrowRight, Bookmark, BookmarkCheck, Link2, Check } from "lucide-react";
import { womenBodyTypes, menBodyTypes } from "@/lib/bodyTypeData";
import { useSavedItems } from "@/hooks/useSavedItems";
import SiteHeader from "@/components/SiteHeader";
import { toast } from "sonner";
import {
  getFullStyleProfile,
  type BodyType,
  type HeightRange,
  type Gender,
} from "@/lib/bodyTypeStyling";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PUBLIC_URL = "https://figure-ai-stylist.vercel.app";

interface DbStyleProfile {
  vibe_description: string | null;
  selected_visual_cues: string[] | null;
  silhouette_type: string | null;
  ab_choices: number[] | null;
  budget_min: number | null;
  budget_max: number | null;
  ai_keywords: string[] | null;
  ai_silhouettes: string[] | null;
  ai_style_brief: string | null;
  body_input_method: string | null;
  manual_measurements: any;
  height_inches?: number | null;
  shopping_preference?: string | null;
  occasions?: string[] | null;
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

const fallbackKeywords = ["Quiet Luxury", "Elevated Basics", "Modern Classic", "Warm Minimalism"];
const fallbackSilhouettes = ["Tailored blazers", "Wide-leg trousers", "Midi skirts", "Structured totes"];
const fallbackBrief =
  "Your style is rooted in quiet confidence. You gravitate toward investment pieces with clean lines and warm, neutral palettes.";

const Profile = () => {
  const navigate = useNavigate();
  const { data: contextData, resetData } = useStyle();
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedItems();
  const [dbProfile, setDbProfile] = useState<DbStyleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState<CategoryRecs[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(PUBLIC_URL);
      setCopied(true);
      toast.success("Link copied", { description: PUBLIC_URL });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      toast.error("Couldn't copy link");
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        // Guest: generate picks from context data if interview was just completed
        if (contextData.profileGenerated) {
          setRecsLoading(true);
          try {
            const { data: gen, error: genErr } = await supabase.functions.invoke(
              "generate-for-you-recs",
              {
                body: {
                  styleProfile: {
                    ai_keywords: contextData.aiKeywords,
                    ai_style_brief: contextData.aiStyleBrief,
                    vibe_description: contextData.vibeDescription,
                    silhouette_type: contextData.silhouetteType,
                    budget_min: contextData.budgetMin,
                    budget_max: contextData.budgetMax,
                    shopping_preference: contextData.shoppingPreference,
                    occasions: contextData.occasions,
                    selected_visual_cues: contextData.selectedVisualCues,
                  },
                },
              }
            );
            if (!genErr && gen && !gen.error) {
              setRecs((gen.categories || []) as CategoryRecs[]);
            }
          } catch (genErr) {
            console.error("Guest rec generation failed:", genErr);
          } finally {
            setRecsLoading(false);
          }
        }
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from("style_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        if (data) setDbProfile(data as DbStyleProfile);

        // Load cached For You recs (preview) — generate if missing
        const { data: cached } = await supabase
          .from("for_you_recs")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cached?.recs) {
          setRecs(((cached.recs as any).categories as CategoryRecs[]) || []);
        } else if (data) {
          setRecsLoading(true);
          try {
            const { data: gen, error: genErr } = await supabase.functions.invoke(
              "generate-for-you-recs",
              {
                body: {
                  styleProfile: {
                    ai_keywords: (data as any).ai_keywords,
                    ai_style_brief: (data as any).ai_style_brief,
                    vibe_description: (data as any).vibe_description,
                    silhouette_type: (data as any).silhouette_type,
                    budget_min: (data as any).budget_min,
                    budget_max: (data as any).budget_max,
                    shopping_preference: (data as any).shopping_preference,
                    height_inches: (data as any).height_inches,
                    occasions: (data as any).occasions,
                    selected_visual_cues: (data as any).selected_visual_cues,
                  },
                },
              }
            );
            if (!genErr && gen && !gen.error) {
              const newRecs = (gen.categories || []) as CategoryRecs[];
              setRecs(newRecs);
              await supabase.from("for_you_recs").upsert(
                [
                  {
                    user_id: user.id,
                    recs: { categories: newRecs } as any,
                    generated_at: gen.generatedAt,
                  },
                ],
                { onConflict: "user_id" }
              );
            }
          } catch (genErr) {
            console.error("Preview rec generation failed:", genErr);
          } finally {
            setRecsLoading(false);
          }
        }
      } catch (err) {
        console.error("Failed to load style profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  // Merge: DB profile takes priority, fall back to context AI results, then defaults
  const vibeDescription = dbProfile?.vibe_description || contextData.vibeDescription || "";
  const keywords = dbProfile?.ai_keywords?.length ? dbProfile.ai_keywords :
    (contextData.aiKeywords?.length ? contextData.aiKeywords :
      (contextData.selectedVisualCues.length > 0 ? contextData.selectedVisualCues : fallbackKeywords));
  const silhouettes = dbProfile?.ai_silhouettes?.length ? dbProfile.ai_silhouettes :
    (contextData.aiSilhouettes?.length ? contextData.aiSilhouettes : fallbackSilhouettes);
  const brief = dbProfile?.ai_style_brief || contextData.aiStyleBrief || fallbackBrief;
  const silhouetteType = dbProfile?.silhouette_type || contextData.silhouetteType || "";
  const budgetMin = dbProfile?.budget_min ?? contextData.budgetMin ?? 50;
  const budgetMax = dbProfile?.budget_max ?? contextData.budgetMax ?? 500;
  const visualCues = dbProfile?.selected_visual_cues?.length ? dbProfile.selected_visual_cues : contextData.selectedVisualCues;
  const occasions = dbProfile?.occasions?.length ? dbProfile.occasions : contextData.occasions;
  const isGuest = !user && contextData.profileGenerated;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      {/* Save banner for guests */}
      {isGuest && (
        <div className="bg-primary text-primary-foreground px-6 py-3 flex items-center justify-between gap-4">
          <p className="text-sm font-sans">
            Sign in to save your style profile and unlock your closet, planner, and AI picks.
          </p>
          <button
            onClick={() => navigate("/auth?next=/profile")}
            className="text-sm font-sans font-semibold underline underline-offset-2 whitespace-nowrap hover:opacity-80 transition-opacity"
          >
            Sign in to save →
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/interview")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to interview
          </button>
          <span className="font-serif text-lg text-foreground">My Style</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              aria-label="Copy public link"
              title="Copy public link"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Link2 className="w-4 h-4" />}
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-16 py-12 max-w-5xl">
        {/* Style Brief */}
        <section className="mb-16 animate-fade-in-up">
          <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-4">
            Style understanding
          </p>
          <h1 className="text-3xl md:text-5xl font-serif font-medium text-foreground mb-6 leading-tight">
            {keywords.slice(0, 2).join(" · ")}
          </h1>
          <p className="text-lg text-secondary font-sans font-light leading-relaxed max-w-3xl">
            {brief}
          </p>
          {vibeDescription && (
            <div className="mt-6 p-5 bg-card rounded-2xl border border-border shadow-soft max-w-2xl">
              <p className="text-xs text-muted-foreground font-sans mb-1.5">
                Based on your own words
              </p>
              <p className="text-sm text-foreground font-sans italic">"{vibeDescription}"</p>
            </div>
          )}
        </section>

        {/* Keywords / Visual Cues */}
        <div className="mb-16">
          <section className="animate-fade-in-up opacity-0 animation-delay-100">
            <h2 className="text-xl font-serif text-foreground mb-4">
              {visualCues.length > 0 ? "Your style cues" : "Aesthetic keywords"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {(visualCues.length > 0 ? visualCues : keywords).map((kw) => (
                <span
                  key={kw}
                  className="px-4 py-2 rounded-full bg-muted text-sm font-sans text-foreground"
                >
                  {kw}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Silhouettes & Details */}
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          <section className="animate-fade-in-up opacity-0 animation-delay-200">
            <h2 className="text-xl font-serif text-foreground mb-4">Key silhouettes</h2>
            <ul className="space-y-2">
              {silhouettes.map((s) => (
                <li key={s} className="text-sm text-secondary font-sans flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {s}
                </li>
              ))}
            </ul>
          </section>

          <section className="animate-fade-in-up opacity-0 animation-delay-300">
            <h2 className="text-xl font-serif text-foreground mb-4">Budget range</h2>
            <p className="text-sm text-secondary font-sans">${budgetMin} – ${budgetMax} per piece</p>
          </section>

          <section className="animate-fade-in-up opacity-0 animation-delay-400">
            <h2 className="text-xl font-serif text-foreground mb-4">Body input</h2>
            <p className="text-sm text-secondary font-sans capitalize">
              {dbProfile?.body_input_method || contextData.bodyInputMethod || "Not specified"}
              {silhouetteType ? ` · ${silhouetteType}` : ""}
            </p>
          </section>

          <section className="animate-fade-in-up opacity-0 animation-delay-200">
            <h2 className="text-xl font-serif text-foreground mb-4">Dressing for</h2>
            {occasions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {occasions.map((o) => (
                  <span
                    key={o}
                    className="px-3 py-1 rounded-full border border-border text-xs font-sans text-foreground"
                  >
                    {o}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground font-sans">Not specified</p>
            )}
          </section>
        </div>

        {/* What to Avoid — based on body type */}
        {(() => {
          const allTypes = [...womenBodyTypes, ...menBodyTypes];
          const match = allTypes.find(
            (t) =>
              t.id === silhouetteType ||
              t.name.toLowerCase().includes((silhouetteType || "").toLowerCase())
          );
          if (!match) return null;
          const skipItems = match.skip.split(",").map((s) => s.trim());
          const wearItems = match.wear.split(",").map((s) => s.trim());
          return (
            <section className="mb-16 animate-fade-in-up opacity-0 animation-delay-300">
              <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-3">
                Based on your {match.name} silhouette
              </p>
              <h2 className="text-2xl md:text-3xl font-serif font-medium text-foreground mb-6">
                What to wear and what to avoid
              </h2>
              <p className="text-sm text-secondary font-sans mb-6 max-w-2xl">
                {match.desc}
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-3xl p-6 shadow-soft">
                  <h3 className="font-serif text-lg text-foreground mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Reach for
                  </h3>
                  <ul className="space-y-2">
                    {wearItems.map((item) => (
                      <li key={item} className="text-sm text-secondary font-sans flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-card border border-border rounded-3xl p-6 shadow-soft">
                  <h3 className="font-serif text-lg text-foreground mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    Avoid
                  </h3>
                  <ul className="space-y-2">
                    {skipItems.map((item) => (
                      <li key={item} className="text-sm text-secondary font-sans flex items-start gap-2">
                        <span className="text-destructive mt-0.5">✕</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          );
        })()}

        {/* Height-based styling recommendations */}
        {(() => {
          const heightInches = (dbProfile as any)?.height_inches ?? contextData.heightInches;
          if (!heightInches) return null;

          const shoppingPref =
            (dbProfile as any)?.shopping_preference ?? contextData.shoppingPreference;
          let gender: Gender | undefined;
          if (shoppingPref === "mens") gender = "men";
          else if (shoppingPref === "womens") gender = "women";

          // Thresholds: women petite ≤63" (5'3"), tall ≥69" (5'9");
          // men petite ≤67" (5'7"), tall ≥73" (6'1"); default to women thresholds.
          const isMen = gender === "men";
          const shortMax = isMen ? 67 : 63;
          const tallMin = isMen ? 73 : 69;
          let height: HeightRange | null = null;
          if (heightInches <= shortMax) height = "short";
          else if (heightInches >= tallMin) height = "tall";
          if (!height) return null;

          // Map silhouetteType (which can be from women/men sets) to BodyType
          const rawSil = (silhouetteType || "").toLowerCase();
          const silMap: Record<string, BodyType> = {
            hourglass: "hourglass",
            pear: "pear",
            triangle: "pear",
            apple: "apple",
            oval: "apple",
            rectangle: "rectangle",
            "inverted-triangle": "inverted-triangle",
            trapezoid: "inverted-triangle",
          };
          const bodyType: BodyType = silMap[rawSil] || "rectangle";

          const { heightProfiles, coreHeightRule } = getFullStyleProfile({
            bodyType,
            height,
            gender,
          });

          // Combine all wear-this tips (most-flattering + flattering) and avoid tips
          const wearTips = heightProfiles.flatMap((p) =>
            p.tips
              .filter((t) => t.fit !== "avoid")
              .map((t) => ({ ...t, source: p.label }))
          );
          const avoidTips = heightProfiles.flatMap((p) =>
            p.tips
              .filter((t) => t.fit === "avoid")
              .map((t) => ({ ...t, source: p.label }))
          );

          const showTallWomenNote = height === "tall" && gender === "women";

          return (
            <section className="mb-16 animate-fade-in-up opacity-0 animation-delay-300">
              <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-3">
                Based on your height
              </p>
              <h2 className="text-2xl md:text-3xl font-serif font-medium text-foreground mb-6">
                Dressing for your frame
              </h2>

              {/* Core rule callout */}
              {coreHeightRule && (
                <div className="bg-card border border-border rounded-3xl p-6 shadow-soft mb-8">
                  <p className="text-xs tracking-[0.14em] uppercase text-primary font-sans mb-2">
                    The core rule
                  </p>
                  <p className="text-base md:text-lg font-serif text-foreground leading-snug">
                    {coreHeightRule}
                  </p>
                </div>
              )}

              {showTallWomenNote && (
                <div className="bg-card border border-border rounded-3xl p-6 shadow-soft mb-8">
                  <p className="text-sm font-sans text-foreground leading-relaxed">
                    <span className="font-medium">A note for tall frames:</span> you have the most
                    flexibility of any height — tall frames carry volume, length, and statement
                    pieces beautifully. Nothing is truly off-limits.
                  </p>
                </div>
              )}

              {/* Wear this — cards */}
              <h3 className="font-serif text-lg text-foreground mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Wear this
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {wearTips.map((t, i) => (
                  <div
                    key={`${t.tip}-${i}`}
                    className="bg-card border border-border rounded-2xl p-5 shadow-soft"
                  >
                    <p className="font-sans font-medium text-foreground text-sm mb-1.5">
                      {t.tip}
                    </p>
                    <p className="text-xs text-secondary font-sans leading-relaxed">
                      {t.why}
                    </p>
                  </div>
                ))}
              </div>

              {/* Be mindful of — expandable */}
              {avoidTips.length > 0 && (
                <Accordion type="single" collapsible className="border border-border rounded-2xl bg-card shadow-soft">
                  <AccordionItem value="avoid" className="border-b-0">
                    <AccordionTrigger className="px-5 hover:no-underline">
                      <span className="flex items-center gap-2 font-serif text-base text-foreground">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        Be mindful of ({avoidTips.length})
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-5">
                      <div className="grid sm:grid-cols-2 gap-4 pt-2">
                        {avoidTips.map((t, i) => (
                          <div
                            key={`${t.tip}-${i}`}
                            className="bg-background border border-border rounded-2xl p-4"
                          >
                            <p className="font-sans font-medium text-foreground text-sm mb-1.5">
                              {t.tip}
                            </p>
                            <p className="text-xs text-secondary font-sans leading-relaxed">
                              {t.why}
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </section>
          );
        })()}

        {/* Pieces For You — preview */}
        <section className="mb-16 animate-fade-in-up opacity-0 animation-delay-300">
          <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
            <div>
              <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Pieces for you
              </p>
              <h2 className="text-2xl md:text-3xl font-serif font-medium text-foreground">
                Curated to match your style
              </h2>
            </div>
            <button
              onClick={() => navigate("/for-you")}
              className="text-sm font-sans text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
            >
              See all picks
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Category filter */}
          {recs.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {(() => {
                const available = recs.filter((c) => c.products.length > 0).map((c) => c.category);
                const options = ["all", ...available];
                return options.map((opt) => {
                  const active = categoryFilter === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCategoryFilter(opt)}
                      className={`px-4 py-1.5 rounded-full text-xs font-sans transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt === "all" ? "All" : opt}
                    </button>
                  );
                });
              })()}
            </div>
          )}

          {recsLoading ? (
            <div className="flex items-center gap-3 py-12 text-muted-foreground font-sans text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Finding pieces for your aesthetic…
            </div>
          ) : recs.length === 0 ? (
            <div className="bg-card border border-border rounded-3xl p-8 text-center shadow-soft">
              <p className="text-sm text-secondary font-sans mb-4">
                We couldn't find picks just yet.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/for-you")}
                className="font-sans rounded-full"
              >
                Try for you
              </Button>
            </div>
          ) : (
            <div className="space-y-10">
              {recs
                .filter((c) => c.products.length > 0)
                .filter((c) => categoryFilter === "all" || c.category === categoryFilter)
                .slice(0, categoryFilter === "all" ? 3 : 10)
                .map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-baseline justify-between mb-3">
                      <h3 className="text-lg font-serif text-foreground">{cat.category}</h3>
                      <p className="text-xs text-muted-foreground/70 font-sans">
                        {cat.products.length} {cat.products.length === 1 ? "pick" : "picks"}
                      </p>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-3 snap-x -mx-6 px-6 lg:-mx-16 lg:px-16">
                      {cat.products.slice(0, 6).map((p, i) => (
                        <a
                          key={`${cat.category}-${i}`}
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 w-44 md:w-52 group snap-start"
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
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Wear More. Waste Less. */}
        <section className="mb-16 animate-fade-in-up opacity-0 animation-delay-400">
          <div className="grid md:grid-cols-[1fr_1.5fr] gap-12 items-start bg-card border border-border rounded-3xl p-8 md:p-10 shadow-soft">
            <div>
              <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-4">
                Wear more, waste less
              </p>
              <h2 className="text-2xl md:text-4xl font-serif font-medium text-foreground leading-tight">
                Buy once.
                <br />
                Wear it 100 ways.
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-base md:text-lg font-sans font-light text-secondary leading-relaxed">
                The average garment is worn just <span className="text-foreground font-medium">7 times</span> before
                being discarded. We don't recommend trendy pieces that expire in a season — we recommend
                <span className="text-foreground font-medium"> versatile investment pieces</span> that
                work across your life.
              </p>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { stat: "30×", label: "Target wears per piece" },
                  { stat: "↓ 67%", label: "Less impulse buying" },
                  { stat: "3-in-1", label: "Avg. styling versatility" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <p className="text-xl md:text-2xl font-serif font-medium text-primary">{item.stat}</p>
                    <p className="text-xs font-sans text-muted-foreground mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
              <blockquote className="border-l-2 border-primary/30 pl-6">
                <p className="text-sm font-sans italic text-secondary leading-relaxed">
                  "The most sustainable garment is the one already in your closet —
                  the second most sustainable is one you'll actually wear 100 times."
                </p>
                <cite className="text-xs font-sans text-muted-foreground/60 mt-2 block not-italic">
                  — Orsola de Castro, Fashion Revolution
                </cite>
              </blockquote>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="mb-16 animate-fade-in-up opacity-0 animation-delay-400">
          <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-3">
            What's next
          </p>
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-foreground mb-6">
            Put your style to work
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/closet")}
              className="bg-card border border-border rounded-3xl p-6 text-left hover:border-primary/30 transition-all shadow-soft group"
            >
              <Shirt className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-serif text-lg text-foreground mb-1">My closet</h3>
              <p className="text-sm text-secondary font-sans font-light">
                Add what you already own so recommendations build outfits from your wardrobe first.
              </p>
            </button>
            <button
              onClick={() => navigate("/planner")}
              className="bg-card border border-border rounded-3xl p-6 text-left hover:border-primary/30 transition-all shadow-soft group"
            >
              <CalendarDays className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-serif text-lg text-foreground mb-1">Plan your week</h3>
              <p className="text-sm text-secondary font-sans font-light">
                Get weather-aware, occasion-matched outfits for every day of the week.
              </p>
            </button>
          </div>
        </section>

        {/* Start Over */}
        <div className="text-center pt-8 border-t border-border">
          <Button
            variant="outline"
            onClick={() => {
              resetData();
              navigate("/");
            }}
            className="text-secondary hover:text-foreground font-sans rounded-full"
          >
            Start a new interview
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Profile;