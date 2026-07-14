import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription, startCheckout } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Pricing = () => {
  const { user, session } = useAuth();
  const { isSubscribed, loading } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("subscribed") === "true") {
      toast.success("You're subscribed! Welcome to Styling Companion.");
      navigate("/closet", { replace: true });
    }
    if (searchParams.get("canceled") === "true") {
      toast.error("Subscription canceled. You can subscribe anytime.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && isSubscribed) {
      navigate("/closet", { replace: true });
    }
  }, [isSubscribed, loading]);

  const handleSubscribe = async () => {
    if (!user || !session) {
      navigate("/auth?next=/pricing");
      return;
    }

    setCheckoutLoading(true);
    try {
      await startCheckout(session.access_token, window.location.origin + "/pricing");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-sans text-sm uppercase tracking-[0.2em]">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <p className="text-xs font-sans uppercase tracking-[0.3em] text-muted-foreground mb-4">
          Styling Companion
        </p>
        <h1 className="text-4xl font-serif text-foreground mb-4">
          Figure out what to buy
        </h1>
        <p className="text-muted-foreground font-sans mb-10 leading-relaxed">
          Your AI-powered closet, outfit planner, and personal style guide, all in one place.
        </p>

        <div className="border border-border p-8 mb-8">
          <p className="text-xs font-sans uppercase tracking-[0.3em] text-muted-foreground mb-2">
            Full Access
          </p>
          <div className="flex items-baseline justify-center gap-1 mb-6">
            <span className="text-5xl font-serif text-foreground">$9</span>
            <span className="text-muted-foreground font-sans text-sm">/month</span>
          </div>

          <ul className="text-sm font-sans text-muted-foreground space-y-3 mb-8 text-left">
            <li className="flex items-center gap-3">
              <span className="text-foreground">→</span>
              AI style profile & interview
            </li>
            <li className="flex items-center gap-3">
              <span className="text-foreground">→</span>
              Digital closet with smart tagging
            </li>
            <li className="flex items-center gap-3">
              <span className="text-foreground">→</span>
              Outfit planner & calendar
            </li>
            <li className="flex items-center gap-3">
              <span className="text-foreground">→</span>
              Personalized "For You" recs
            </li>
            <li className="flex items-center gap-3">
              <span className="text-foreground">→</span>
              Style guides curated to you
            </li>
          </ul>

          <Button
            onClick={handleSubscribe}
            disabled={checkoutLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none py-6 text-sm font-sans font-semibold uppercase tracking-[0.2em]"
          >
            {checkoutLoading ? "Redirecting…" : "Start Subscription"}
          </Button>
        </div>

        <button
          onClick={() => navigate("/")}
          className="text-xs text-muted-foreground/60 font-sans hover:text-muted-foreground transition-colors"
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
};

export default Pricing;
