import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, ExternalLink, BookmarkX } from "lucide-react";
import { toast } from "sonner";

interface SavedItem {
  id: string;
  title: string;
  price: number | null;
  currency: string;
  image: string | null;
  link: string;
  retailer: string | null;
  category: string | null;
  created_at: string;
}

const Saved = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadSaved();
  }, [user]);

  const loadSaved = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("saved_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setItems((data || []) as SavedItem[]);
    } catch (err) {
      console.error("Failed to load saved items:", err);
      toast.error("Could not load your shortlist");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (item: SavedItem) => {
    if (!user) return;
    setRemovingId(item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    try {
      const { error } = await supabase
        .from("saved_items")
        .delete()
        .eq("user_id", user.id)
        .eq("link", item.link);
      if (error) throw error;
      toast.success("Removed from your shortlist");
    } catch (err) {
      console.error("Remove failed:", err);
      setItems((prev) => [...prev, item].sort((a, b) => b.created_at.localeCompare(a.created_at)));
      toast.error("Could not remove that piece");
    } finally {
      setRemovingId(null);
    }
  };

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category).filter(Boolean) as string[]))];
  const visibleItems = categoryFilter === "All" ? items : items.filter((i) => i.category === categoryFilter);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-6" />
        <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground font-sans">
          Loading your shortlist
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/for-you")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            For You
          </button>
          <span className="font-serif text-lg text-foreground">Your Shortlist</span>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-16 py-12 max-w-6xl">
        <div className="mb-8">
          <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-2 font-sans">
            Saved Pieces
          </p>
          <h1 className="text-3xl md:text-5xl font-serif text-foreground mb-3">
            {items.length} {items.length === 1 ? "piece" : "pieces"} saved
          </h1>
        </div>

        {categories.length > 2 && (
          <div className="mb-8 flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 text-xs font-sans uppercase tracking-wider rounded-none border transition-colors ${
                  categoryFilter === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {visibleItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-sans mb-2">
              Nothing saved yet.
            </p>
            <p className="text-sm text-muted-foreground/60 font-sans mb-6">
              Bookmark pieces from your picks and they'll show up here.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/for-you")}
              className="rounded-none font-sans text-xs uppercase tracking-wider"
            >
              Back to your picks
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleItems.map((item) => (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="aspect-[3/4] bg-muted overflow-hidden relative border border-border group-hover:border-primary/30 transition-colors">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-sans">
                      {item.category || "Saved"}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeItem(item);
                    }}
                    disabled={removingId === item.id}
                    aria-label="Remove from shortlist"
                    className="absolute top-2 left-2 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-sm"
                  >
                    <BookmarkX className="w-4 h-4" />
                  </button>
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-3.5 h-3.5 text-foreground" />
                  </div>
                </div>
                <div className="pt-3">
                  <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-wider truncate">
                    {item.retailer || "Retailer"}
                  </p>
                  <p className="text-sm font-sans text-foreground leading-tight mt-0.5 line-clamp-2">
                    {item.title}
                  </p>
                  {item.price !== null && (
                    <p className="text-sm font-sans text-foreground font-medium mt-1">
                      ${item.price}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Saved;
