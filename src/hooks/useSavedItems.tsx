import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface SavableProduct {
  title: string;
  price: number | null;
  currency?: string;
  image: string | null;
  link: string;
  retailer?: string;
  category?: string;
  source_query?: string;
}

export const useSavedItems = () => {
  const { user } = useAuth();
  const [savedLinks, setSavedLinks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setSavedLinks(new Set());
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("saved_items")
        .select("link")
        .eq("user_id", user.id);
      if (error) throw error;
      setSavedLinks(new Set((data ?? []).map((r) => r.link)));
    } catch (err) {
      console.error("Failed to load saved items:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isSaved = useCallback((link: string) => savedLinks.has(link), [savedLinks]);

  const toggleSave = useCallback(
    async (product: SavableProduct) => {
      if (!user) {
        toast.error("Sign in to save pieces.");
        return false;
      }
      const wasSaved = savedLinks.has(product.link);

      // Optimistic update
      setSavedLinks((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(product.link);
        else next.add(product.link);
        return next;
      });

      try {
        if (wasSaved) {
          const { error } = await supabase
            .from("saved_items")
            .delete()
            .eq("user_id", user.id)
            .eq("link", product.link);
          if (error) throw error;
          toast.success("Removed from your shortlist");
        } else {
          const { error } = await supabase.from("saved_items").insert({
            user_id: user.id,
            title: product.title,
            price: product.price,
            currency: product.currency ?? "USD",
            image: product.image,
            link: product.link,
            retailer: product.retailer,
            category: product.category,
            source_query: product.source_query,
          });
          if (error) throw error;
          toast.success("Saved to your shortlist");
        }
        return true;
      } catch (err) {
        console.error("Save toggle failed:", err);
        // Revert
        setSavedLinks((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(product.link);
          else next.delete(product.link);
          return next;
        });
        toast.error("Could not update your shortlist");
        return false;
      }
    },
    [user, savedLinks]
  );

  return { isSaved, toggleSave, savedLinks, loading, refresh };
};
