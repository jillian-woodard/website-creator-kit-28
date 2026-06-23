import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Subscription {
  status: string;
  current_period_end: string | null;
  stripe_subscription_id: string | null;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  isSubscribed: boolean;
  loading: boolean;
  refresh: () => void;
}

export const useSubscription = (): SubscriptionContextType => {
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("subscriptions")
      .select("status, current_period_end, stripe_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching subscription:", error);
    }

    setSubscription(data ?? null);
    setLoading(false);
  };

  useEffect(() => {
    // Auth hasn't resolved yet (fresh page load) — don't act on a possibly
    // stale/null `user` until we actually know the real auth state. Acting
    // early here is what caused ProtectedRoute to see a premature
    // "not subscribed" reading and bounce subscribed users away.
    if (authLoading) return;
    fetchSubscription();
  }, [user, authLoading]);

  const isSubscribed =
    subscription?.status === "active" || subscription?.status === "trialing";

  // Stay "loading" until auth itself has resolved too, so consumers never
  // read isSubscribed based on a not-yet-fetched/incorrect subscription.
  return { subscription, isSubscribed, loading: authLoading || loading, refresh: fetchSubscription };
};

export const startCheckout = async (
  accessToken: string,
  returnUrl: string
): Promise<void> => {
  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: { return_url: returnUrl },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (error) throw error;
  if (data?.url) window.location.href = data.url;
};
