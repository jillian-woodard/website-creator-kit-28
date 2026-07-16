import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Sun, Cloud, CloudRain, Snowflake, Loader2, Shirt, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { searchCity, getWeekForecast } from "@/lib/weather";
import type { Tables } from "@/integrations/supabase/types";

type ClosetItem = Tables<"closet_items">;

const OCCASIONS = ["Work", "Casual", "Date Night", "Gym", "Formal", "Brunch", "Travel", "WFH"];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface DayPlan {
  date: string;
  dayName: string;
  tempHigh: number;
  tempLow: number;
  condition: string;
  occasion: string;
  outfit: OutfitData | null;
}

interface RetailerLink {
  name: string;
  url: string;
}

interface OutfitItem {
  name: string;
  category: string;
  fromCloset: boolean;
  brand?: string;
  estimatedPrice?: number;
  searchUrl?: string;
  retailerLinks?: RetailerLink[];
}

interface OutfitData {
  items: OutfitItem[];
  stylingTip: string;
}

const weatherIcon = (condition: string) => {
  const c = condition.toLowerCase();
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower")) return <CloudRain className="w-5 h-5" />;
  if (c.includes("snow") || c.includes("hail")) return <Snowflake className="w-5 h-5" />;
  if (c.includes("cloud") || c.includes("overcast") || c.includes("fog")) return <Cloud className="w-5 h-5" />;
  return <Sun className="w-5 h-5" />;
};

const Planner = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [cityQuery, setCityQuery] = useState("");
  const [cityResults, setCityResults] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<{ name: string; lat: number; lon: number; country: string } | null>(null);
  const [days, setDays] = useState<DayPlan[]>([]);
  const [generating, setGenerating] = useState(false);
  const [closetItems, setClosetItems] = useState<ClosetItem[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      supabase
        .from("closet_items")
        .select("*")
        .then(({ data }) => setClosetItems(data || []));
    }
  }, [user]);

  // City search with debounce
  const handleCityInput = (val: string) => {
    setCityQuery(val);
    if (searchTimeout) clearTimeout(searchTimeout);
    if (val.length >= 2) {
      const t = setTimeout(async () => {
        const results = await searchCity(val);
        setCityResults(results);
      }, 300);
      setSearchTimeout(t);
    } else {
      setCityResults([]);
    }
  };

  const selectCity = async (city: any) => {
    setSelectedCity({ name: city.name, lat: city.latitude, lon: city.longitude, country: city.country });
    setCityQuery(`${city.name}, ${city.country}`);
    setCityResults([]);

    const forecast = await getWeekForecast(city.latitude, city.longitude);
    setDays(
      forecast.map((f) => ({
        date: f.date,
        dayName: DAY_NAMES[new Date(f.date + "T12:00:00").getDay()],
        tempHigh: f.tempHigh,
        tempLow: f.tempLow,
        condition: f.condition,
        occasion: "Casual",
        outfit: null,
      }))
    );
  };

  const setOccasion = (index: number, occasion: string) => {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, occasion } : d)));
  };

  const generateOutfits = async () => {
    if (!user || days.length === 0) return;
    setGenerating(true);

    try {
      // Get user's style profile
      const { data: styleProfile } = await supabase
        .from("style_profiles")
        .select("*")
        .limit(1)
        .maybeSingle();

      const { data, error } = await supabase.functions.invoke("generate-outfits", {
        body: {
          days: days.map((d) => ({
            date: d.date,
            dayName: d.dayName,
            tempHigh: d.tempHigh,
            tempLow: d.tempLow,
            condition: d.condition,
            occasion: d.occasion,
          })),
          closetItems: closetItems.map((i) => ({
            name: i.name,
            category: i.category,
            color: i.color,
            brand: i.brand,
            season: i.season,
          })),
          styleProfile: styleProfile
            ? {
                vibeDescription: styleProfile.vibe_description,
                keywords: styleProfile.ai_keywords,
                budgetMin: styleProfile.budget_min,
                budgetMax: styleProfile.budget_max,
              }
            : null,
        },
      });

      if (error) throw error;

      if (data?.outfits) {
        setDays((prev) =>
          prev.map((d, i) => ({
            ...d,
            outfit: data.outfits[i] || null,
          }))
        );
        toast.success("Outfits generated!");
      }
    } catch (err: any) {
      console.error("Generate error:", err);
      toast.error(err.message || "Failed to generate outfits");
    } finally {
      setGenerating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-sans">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/closet")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Closet
          </button>
          <span className="font-serif text-lg text-foreground">Trip planning</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-16 py-12 max-w-5xl">
        {/* City Search */}
        <section className="mb-10">
          <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-3">
            Step 1 — Location
          </p>
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-foreground mb-4">Where are you this week?</h2>
          <div className="relative max-w-md">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search city..."
              value={cityQuery}
              onChange={(e) => handleCityInput(e.target.value)}
              className="pl-10 font-sans"
            />
            {cityResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-2xl mt-2 z-20 shadow-soft-lg overflow-hidden">
                {cityResults.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => selectCity(c)}
                    className="w-full text-left px-4 py-3 text-sm font-sans hover:bg-muted transition-colors border-b border-border last:border-0"
                  >
                    {c.name}, {c.country}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Week View */}
        {days.length > 0 && (
          <>
            <section className="mb-10">
              <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-3">
                Step 2 — Tag your week
              </p>
              <h2 className="text-2xl md:text-3xl font-serif font-medium text-foreground mb-6">
                What's on the agenda?
              </h2>

              <div className="space-y-3">
                {days.map((day, i) => (
                  <div
                    key={day.date}
                    className="bg-card border border-border rounded-2xl shadow-soft p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <div className="text-muted-foreground">{weatherIcon(day.condition)}</div>
                      <div>
                        <p className="text-sm font-sans font-medium text-foreground">{day.dayName}</p>
                        <p className="text-xs text-muted-foreground font-sans">
                          {day.tempHigh}°/{day.tempLow}° · {day.condition}
                        </p>
                      </div>
                    </div>
                    <Select value={day.occasion} onValueChange={(v) => setOccasion(i, v)}>
                      <SelectTrigger className="font-sans flex-1 max-w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OCCASIONS.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Outfit display */}
                    {day.outfit && (
                      <div className="flex-1 flex flex-wrap gap-2">
                        {day.outfit.items.map((item, j) => (
                          <span
                            key={j}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-sans rounded-full ${
                              item.fromCloset
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {item.fromCloset ? (
                              <Shirt className="w-3 h-3" />
                            ) : (
                              <ShoppingBag className="w-3 h-3" />
                            )}
                            {item.name}
                            {item.estimatedPrice && !item.fromCloset && (
                              <span className="text-xs opacity-60">~${item.estimatedPrice}</span>
                            )}
                            {!item.fromCloset && (
                              <span className="inline-flex gap-1 ml-1">
                                {item.retailerLinks && item.retailerLinks.length > 0 ? (
                                  item.retailerLinks.map((r, k) => (
                                    <a
                                      key={k}
                                      href={r.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                    >
                                      {r.name}
                                    </a>
                                  ))
                                ) : item.searchUrl ? (
                                  <a
                                    href={item.searchUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    Shop
                                  </a>
                                ) : null}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Closet summary — wardrobe-first framing: what you own is checked before anything new */}
            <div className="mb-8 bg-card border border-border rounded-2xl shadow-soft p-5 flex items-start gap-3">
              <Shirt className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-sans text-foreground font-medium mb-0.5">
                  {closetItems.length > 0
                    ? `Starting from your ${closetItems.length}-piece closet`
                    : "Your closet is empty"}
                </p>
                <p className="text-sm font-sans text-secondary">
                  {closetItems.length > 0
                    ? "Outfits are built from what you already own first — only what's missing gets a shoppable suggestion."
                    : "Add a few pieces to your closet so outfits can be built from what you own before anything new is suggested."}
                </p>
              </div>
            </div>

            <Button
              onClick={generateOutfits}
              disabled={generating}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-sm font-sans gap-3"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate outfits"
              )}
            </Button>

            {/* Styling tips */}
            {days.some((d) => d.outfit?.stylingTip) && (
              <section className="mt-12">
                <h3 className="text-xl font-serif text-foreground mb-4">Styling notes</h3>
                <div className="space-y-3">
                  {days
                    .filter((d) => d.outfit?.stylingTip)
                    .map((d) => (
                      <div key={d.date} className="bg-card border border-border rounded-2xl shadow-soft p-4">
                        <p className="text-xs font-sans text-muted-foreground">
                          {d.dayName}
                        </p>
                        <p className="text-sm font-sans text-foreground mt-1">{d.outfit!.stylingTip}</p>
                      </div>
                    ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Planner;
