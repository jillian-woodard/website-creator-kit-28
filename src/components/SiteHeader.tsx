import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Compass, Wand2, ShoppingBasket, Shirt, LogOut } from "lucide-react";

// The four-stage product journey. Kept to exactly these so primary navigation never grows
// past four items, per the "whitespace over more links" rule.
const JOURNEY_NAV = [
  { label: "Discover", to: "/interview", icon: Compass },
  { label: "Define", to: "/profile", icon: Wand2 },
  { label: "Shop", to: "/for-you", icon: ShoppingBasket },
  { label: "Wear", to: "/closet", icon: Shirt },
];

const PROFILE_MENU = [
  { label: "My Style", to: "/profile" },
  { label: "Wardrobe", to: "/closet" },
  { label: "Trips", to: "/planner" },
  { label: "Saved items", to: "/saved" },
];

interface DbStyleProfileLite {
  vibe_description: string | null;
  selected_visual_cues: string[] | null;
  silhouette_type: string | null;
  budget_min: number | null;
  budget_max: number | null;
  occasions: string[] | null;
  shopping_preference: string | null;
  ai_keywords: string[] | null;
}

// Genuine completeness score from real profile fields — never a fabricated number.
// Seven inputs, each worth 1/7, rounded to the nearest percent.
const computeUnderstanding = (p: DbStyleProfileLite | null): number => {
  if (!p) return 0;
  const checks = [
    !!p.vibe_description,
    !!p.selected_visual_cues && p.selected_visual_cues.length > 0,
    !!p.silhouette_type,
    !!p.budget_min && !!p.budget_max,
    !!p.occasions && p.occasions.length > 0,
    !!p.shopping_preference,
    !!p.ai_keywords && p.ai_keywords.length > 0,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
};

const SiteHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<DbStyleProfileLite | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setProfile(null);
      return;
    }
    supabase
      .from("style_profiles")
      .select(
        "vibe_description, selected_visual_cues, silhouette_type, budget_min, budget_max, occasions, shopping_preference, ai_keywords"
      )
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setProfile((data as DbStyleProfileLite) ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const understanding = computeUnderstanding(profile);
  const styleName = profile?.ai_keywords && profile.ai_keywords.length > 0 ? profile.ai_keywords[0] : null;
  const firstName = user?.email ? user.email.split("@")[0] : "";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="px-6 lg:px-16 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="text-sm font-serif font-medium tracking-tight text-foreground flex-shrink-0"
        >
          Figure
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {JOURNEY_NAV.map((item) => {
            const active = location.pathname === item.to;
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={`px-4 py-2 text-sm font-sans rounded-full transition-colors ${
                  active
                    ? "text-foreground bg-muted"
                    : "text-secondary hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-serif text-sm hover:bg-primary/15 transition-colors flex-shrink-0"
                aria-label="Account menu"
              >
                {firstName ? firstName[0].toUpperCase() : "•"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-72 bg-card/95 backdrop-blur-xl border border-border rounded-3xl p-2 shadow-soft-lg"
            >
              <div className="px-4 py-4">
                <p className="text-sm font-sans text-muted-foreground mb-1">
                  {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
                </p>
                {styleName ? (
                  <>
                    <p className="font-serif text-lg text-foreground mb-2">{styleName}</p>
                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${understanding}%` }}
                      />
                    </div>
                    <p className="text-xs font-sans text-muted-foreground">
                      {understanding}% understood
                    </p>
                  </>
                ) : (
                  <p className="font-serif text-lg text-foreground">
                    Your style profile is just getting started
                  </p>
                )}
              </div>
              <DropdownMenuSeparator className="bg-border" />
              {PROFILE_MENU.map((item) => (
                <DropdownMenuItem
                  key={item.to}
                  onSelect={() => navigate(item.to)}
                  className="px-4 py-3 cursor-pointer rounded-xl focus:bg-muted font-sans text-sm text-foreground"
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onSelect={handleSignOut}
                className="px-4 py-3 cursor-pointer rounded-xl focus:bg-muted font-sans text-sm text-secondary flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
              className="text-sm font-sans text-secondary hover:text-foreground rounded-full"
            >
              Sign in
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/interview")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-sans rounded-full px-5"
            >
              Get started
            </Button>
          </div>
        )}
      </div>

      {/* Mobile journey nav — visible below md, kept minimal (no icons, single row) */}
      <nav className="md:hidden flex items-center gap-1 px-6 pb-3 overflow-x-auto">
        {JOURNEY_NAV.map((item) => {
          const active = location.pathname === item.to;
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={`px-3 py-1.5 text-xs font-sans rounded-full whitespace-nowrap transition-colors ${
                active ? "text-foreground bg-muted" : "text-secondary"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};

export default SiteHeader;
