import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface DismissableProduct {
  title: string;
  link: string;
  retailer?: string;
  category?: string;
}

export const useDismissedItems = () => {
  const { user } = useAuth();
  const [dismissedLinks, setDismissedLinks] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!user) {
      setDismissedLinks(new Set());
      return;
    }
    try {
      const { data, error } = await supabase
        .from("rec_dismissals")
        .select("product_link")
        .eq("user_id", user.id);
      if (error) throw error;
      setDismissedLinks(new Set((data ?? []).map((r) => r.product_link)));
    } catch (err) {
      console.error("Failed to load dismissals:", err);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isDismissed = useCallback(
    (link: string) => dismissedLinks.has(link),
    [dismissedLinks]
  );

  const dismiss = useCallback(
    async (product: DismissableProduct) => {
      if (!user) return false;
      // Optimistic
      setDismissedLinks((prev) => new Set(prev).add(product.link));
      try {
        const { error } = await supabase.from("rec_dismissals").insert({
          user_id: user.id,
          product_link: product.link,
          product_title: product.title,
          category: product.category,
          retailer: product.retailer,
        });
        if (error && !String(error.message).includes("duplicate")) throw error;
        toast.success("Got it — we'll show you less like this");
        return true;
      } catch (err) {
        console.error("Dismiss failed:", err);
        setDismissedLinks((prev) => {
          const next = new Set(prev);
          next.delete(product.link);
          return next;
        });
        toast.error("Could not save that feedback");
        return false;
      }
    },
    [user]
  );

  return { isDismissed, dismiss, dismissedLinks, refresh };
};
