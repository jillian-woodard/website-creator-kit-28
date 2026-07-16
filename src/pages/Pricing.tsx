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
        <div className="text-muted-foreground font-sans text-sm">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-4">
          Figure
        </p>
        <h1 className="text-4xl font-serif font-medium text-foreground mb-4">
          Understand your style.
        </h1>
        <p className="text-secondary font-sans mb-10 leading-relaxed">
          Your style profile, digital closet, trip planning, and personalized recommendations, all in one place.
        </p>

        <div className="bg-card border border-border rounded-3xl shadow-soft-lg p-8 mb-8">
          <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-3">
            Full access
          </p>
          <div className="flex items-baseline justify-center gap-1 mb-6">
            <span className="text-5xl font-serif font-medium text-foreground">$9</span>
            <span className="text-muted-foreground font-sans text-sm">/month</span>
          </div>

          <ul className="text-sm font-sans text-secondary space-y-3 mb-8 text-left">
            <li className="flex items-center gap-3">
              <span className="text-primary">→</span>
              Style interview and understanding
            </li>
            <li className="flex items-center gap-3">
              <span className="text-primary">→</span>
              Digital closet with smart tagging
            </li>
            <li className="flex items-center gap-3">
              <span className="text-primary">→</span>
              Trip planning and outfit calendar
            </li>
            <li className="flex items-center gap-3">
              <span className="text-primary">→</span>
              Personalized "For you" recommendations
            </li>
            <li className="flex items-center gap-3">
              <span className="text-primary">→</span>
              Style guides curated to you
            </li>
          </ul>

          <Button
            onClick={handleSubscribe}
            disabled={checkoutLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-6 text-sm font-sans"
          >
            {checkoutLoading ? "Redirecting…" : "Start subscription"}
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
