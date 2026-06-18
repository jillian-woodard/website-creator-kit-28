import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "/closet";

  // If already signed in, bounce to the destination.
  useEffect(() => {
    if (user) navigate(next, { replace: true });
  }, [user, next, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.success("Check your email to confirm your account!");
      } else {
        await signIn(email, password);
        toast.success("Welcome back!");
        navigate(next, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Enter your email above first, then click \"Forgot password?\"");
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Check your email for a password reset link.");
    } catch (err: any) {
      toast.error(err.message || "Could not send reset email");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-serif text-foreground mb-2 text-center">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="text-muted-foreground font-sans text-center mb-8">
          {isSignUp
            ? "Sign up to save your closet and outfit plans."
            : "Sign in to access your closet and planner."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-none border-border font-sans"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="rounded-none border-border font-sans"
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none py-6 text-sm font-sans font-semibold uppercase tracking-[0.2em]"
          >
            {loading ? "..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        {!isSignUp && (
          <button
            onClick={handleForgotPassword}
            disabled={resetLoading}
            className="mt-4 text-sm text-muted-foreground font-sans hover:text-foreground transition-colors block mx-auto"
          >
            {resetLoading ? "Sending..." : "Forgot password?"}
          </button>
        )}

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-6 text-sm text-muted-foreground font-sans hover:text-foreground transition-colors block mx-auto"
        >
          {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
        </button>

        <button
          onClick={() => navigate("/")}
          className="mt-4 text-xs text-muted-foreground/60 font-sans hover:text-muted-foreground transition-colors block mx-auto"
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
};

export default Auth;
