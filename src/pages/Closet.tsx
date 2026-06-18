import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Trash2,
  ArrowLeft,
  CalendarDays,
  X,
  Upload,
  Sparkles,
  Loader2,
  Wand2,
  Shirt,
  AlertCircle,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type ClosetItem = Tables<"closet_items">;

const CATEGORIES = ["Top", "Bottom", "Dress", "Outerwear", "Shoes", "Accessory", "Activewear"];
const SEASONS = ["Spring", "Summer", "Fall", "Winter"];
const MIX_OCCASIONS = ["Work", "Casual", "Date Night", "Gym", "Formal", "Brunch", "Travel", "WFH"];

interface MixOutfitItem {
  name: string;
  category: string;
}

interface MixOutfit {
  items: MixOutfitItem[];
  stylingTip: string;
}

const Closet = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagging, setTagging] = useState(false);
  const [autoTagged, setAutoTagged] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [brand, setBrand] = useState("");
  const [seasons, setSeasons] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Mix My Closet state
  const [showMix, setShowMix] = useState(false);
  const [mixOccasion, setMixOccasion] = useState("");
  const [mixLoading, setMixLoading] = useState(false);
  const [mixOutfits, setMixOutfits] = useState<MixOutfit[] | null>(null);
  const [mixGaps, setMixGaps] = useState<string[]>([]);
  const [styleProfile, setStyleProfile] = useState<{
    vibeDescription: string | null;
    keywords: string[] | null;
    styleBrief: string | null;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchItems();
      fetchStyleProfile();
    }
  }, [user]);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("closet_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load closet items");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const fetchStyleProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("style_profiles")
      .select("vibe_description, ai_keywords, ai_style_brief")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!error && data) {
      setStyleProfile({
        vibeDescription: data.vibe_description,
        keywords: data.ai_keywords,
        styleBrief: data.ai_style_brief,
      });
    }
  };

  const handleMixOutfits = async () => {
    if (!mixOccasion || items.length < 2) return;
    setMixLoading(true);
    setMixOutfits(null);
    setMixGaps([]);
    try {
      const { data, error } = await supabase.functions.invoke("generate-closet-outfits", {
        body: {
          occasion: mixOccasion,
          closetItems: items.map((i) => ({
            name: i.name,
            category: i.category,
            color: i.color,
            brand: i.brand,
            season: i.season,
          })),
          styleProfile,
        },
      });

      if (error || !data || data.error) {
        console.error("Mix My Closet failed:", error || data?.error);
        toast.error("Couldn't build outfits right now. Try again in a moment.");
        return;
      }

      setMixOutfits(data.outfits || []);
      setMixGaps(data.gaps || []);
      if (!data.outfits || data.outfits.length === 0) {
        toast.info("Couldn't find enough variety in your closet for this occasion yet.");
      }
    } catch (err) {
      console.error("Mix My Closet error:", err);
      toast.error("Couldn't build outfits right now. Try again in a moment.");
    } finally {
      setMixLoading(false);
    }
  };

  const findItemByName = (name: string) => items.find((i) => i.name === name);

  // Helper: convert a File to base64 string (without data URL prefix)
  const fileToBase64 = (file: File): Promise<{ base64: string; mediaType: string }> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // result looks like "data:image/jpeg;base64,/9j/4AAQSk..."
        const match = result.match(/^data:(.+);base64,(.+)$/);
        if (!match) return reject(new Error("Failed to read image"));
        resolve({ mediaType: match[1], base64: match[2] });
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const autoTagImage = async (file: File) => {
    setTagging(true);
    setAutoTagged(false);
    try {
      const { base64, mediaType } = await fileToBase64(file);

      const { data, error } = await supabase.functions.invoke("tag-closet-item", {
        body: { imageBase64: base64, mediaType },
      });

      if (error || !data || data.error) {
        console.error("Auto-tag failed:", error || data?.error);
        toast.info("Couldn't auto-tag this one, fill in the details below.");
        return;
      }

      // Prefill any field the user hasn't already filled
      if (data.name && !name) setName(data.name);
      if (data.category && !category) setCategory(data.category);
      if (data.color && !color) setColor(data.color);
      if (data.brand && !brand) setBrand(data.brand);
      if (data.seasons && data.seasons.length > 0 && seasons.length === 0) {
        setSeasons(data.seasons);
      }
      setAutoTagged(true);
      toast.success("Item tagged. Edit anything that's not right.");
    } catch (err) {
      console.error("Auto-tag error:", err);
      toast.info("Couldn't auto-tag this one, fill in the details below.");
    } finally {
      setTagging(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Kick off AI tagging in the background. Don't block the user.
      autoTagImage(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("closet-photos").upload(path, file);
    if (error) {
      toast.error("Image upload failed");
      return null;
    }
    const { data } = supabase.storage.from("closet-photos").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name || !category) return;
    setUploading(true);

    let imageUrl: string | null = null;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const { error } = await supabase.from("closet_items").insert({
      user_id: user.id,
      name,
      category: category.toLowerCase(),
      color: color || null,
      brand: brand || null,
      season: seasons.length > 0 ? seasons.map((s) => s.toLowerCase()) : null,
      image_url: imageUrl,
      notes: notes || null,
    });

    if (error) {
      toast.error("Failed to add item");
    } else {
      toast.success(`${name} added to your closet`);
      resetForm();
      fetchItems();
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("closet_items").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete item");
    } else {
      setItems(items.filter((i) => i.id !== id));
      toast.success("Item removed");
    }
  };

  const resetForm = () => {
    setName("");
    setCategory("");
    setColor("");
    setBrand("");
    setSeasons([]);
    setNotes("");
    setImageFile(null);
    setImagePreview(null);
    setAutoTagged(false);
    setShowAdd(false);
  };

  const toggleSeason = (s: string) => {
    setSeasons((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  if (authLoading || loading) {
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
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Profile
          </button>
          <span className="font-serif text-lg text-foreground">My Closet</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/closet/connect-email")}
              className="rounded-none font-sans text-xs uppercase tracking-wider gap-2"
            >
              <Mail className="w-3.5 h-3.5" />
              Import From Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMix(!showMix)}
              className="rounded-none font-sans text-xs uppercase tracking-wider gap-2"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Mix My Closet
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/planner")}
              className="rounded-none font-sans text-xs uppercase tracking-wider gap-2"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Plan Week
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-16 py-12 max-w-5xl">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-2 font-sans">
              Your Wardrobe
            </p>
            <h1 className="text-3xl md:text-4xl font-serif text-foreground">
              {items.length} {items.length === 1 ? "piece" : "pieces"}
            </h1>
          </div>
          <Button
            onClick={() => setShowAdd(!showAdd)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-sans text-xs uppercase tracking-wider gap-2"
          >
            {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showAdd ? "Cancel" : "Add Item"}
          </Button>
        </div>

        {/* Mix My Closet */}
        {showMix && (
          <div className="border border-border bg-card p-6 mb-10 space-y-4 animate-fade-in">
            <div>
              <h2 className="font-serif text-xl text-foreground mb-1">Mix My Closet</h2>
              <p className="text-sm text-muted-foreground font-sans">
                Pick an occasion and we'll put together outfits from pieces you already own. No new
                purchases.
              </p>
            </div>

            {items.length < 2 ? (
              <p className="text-sm text-muted-foreground font-sans">
                Add at least 2 items to your closet before mixing outfits.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={mixOccasion} onValueChange={setMixOccasion}>
                    <SelectTrigger className="rounded-none font-sans w-48">
                      <SelectValue placeholder="Occasion" />
                    </SelectTrigger>
                    <SelectContent>
                      {MIX_OCCASIONS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleMixOutfits}
                    disabled={!mixOccasion || mixLoading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-sans text-xs uppercase tracking-wider gap-2"
                  >
                    {mixLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Building...
                      </>
                    ) : (
                      "Build Outfits"
                    )}
                  </Button>
                </div>

                {mixOutfits && mixOutfits.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    {mixOutfits.map((outfit, idx) => (
                      <div key={idx} className="border border-border p-4 space-y-3">
                        <div className="flex flex-wrap gap-3">
                          {outfit.items.map((outfitItem) => {
                            const match = findItemByName(outfitItem.name);
                            return (
                              <div key={outfitItem.name} className="flex flex-col items-center w-16">
                                <div className="w-16 h-16 border border-border bg-muted flex items-center justify-center overflow-hidden mb-1">
                                  {match?.image_url ? (
                                    <img
                                      src={match.image_url}
                                      alt={outfitItem.name}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <Shirt className="w-5 h-5 text-muted-foreground" />
                                  )}
                                </div>
                                <span className="text-[10px] text-center text-muted-foreground font-sans truncate w-full">
                                  {outfitItem.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-foreground/80 font-sans italic">{outfit.stylingTip}</p>
                      </div>
                    ))}
                  </div>
                )}

                {mixGaps.length > 0 && (
                  <div className="flex items-start gap-2 pt-2 text-xs text-muted-foreground font-sans">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      {mixGaps.map((gap, idx) => (
                        <p key={idx}>{gap}</p>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Add Item Form */}
        {showAdd && (
          <form
            onSubmit={handleAdd}
            className="border border-border bg-card p-6 mb-10 space-y-4 animate-fade-in"
          >
            {/* Photo upload — moved to top so AI tagging fires first */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-sans text-muted-foreground uppercase tracking-wider">
                  Photo
                </p>
                {tagging && (
                  <p className="text-xs font-sans text-primary flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Reading your item...
                  </p>
                )}
                {autoTagged && !tagging && (
                  <p className="text-xs font-sans text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Tagged. Edit anything below.
                  </p>
                )}
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="w-20 h-20 border border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground font-sans">
                  {imageFile ? imageFile.name : "Upload a photo and we'll tag it for you"}
                </span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                placeholder="Item name (e.g. Black Blazer)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-none font-sans"
              />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-none font-sans">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                placeholder="Color (e.g. Navy)"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="rounded-none font-sans"
              />
              <Input
                placeholder="Brand (optional)"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="rounded-none font-sans"
              />
            </div>

            {/* Seasons */}
            <div>
              <p className="text-xs font-sans text-muted-foreground uppercase tracking-wider mb-2">
                Seasons
              </p>
              <div className="flex gap-2">
                {SEASONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSeason(s)}
                    className={`px-3 py-1.5 text-xs font-sans rounded-none border transition-colors ${
                      seasons.includes(s)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <Input
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-none font-sans"
            />

            <Button
              type="submit"
              disabled={uploading || tagging || !name || !category}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-sans text-xs uppercase tracking-wider"
            >
              {uploading ? "Adding..." : "Add to Closet"}
            </Button>
          </form>
        )}

        {/* Items Grid */}
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-sans mb-2">Your closet is empty.</p>
            <p className="text-sm text-muted-foreground/60 font-sans">
              Add items you already own so the planner can mix them into your outfits.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group border border-border bg-card overflow-hidden hover:border-primary/30 transition-all"
              >
                <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground font-sans uppercase tracking-wider">
                      {item.category}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  {item.brand && (
                    <p className="text-[10px] text-muted-foreground font-sans uppercase tracking-wider">
                      {item.brand}
                    </p>
                  )}
                  <p className="text-sm font-sans text-foreground font-medium truncate">{item.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground font-sans capitalize">
                      {item.color || item.category}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Closet;
