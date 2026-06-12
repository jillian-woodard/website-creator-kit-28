import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, UserCircle, ShoppingBag, Shirt, CalendarDays, ChevronDown, Info } from "lucide-react";
import { styleIcons } from "@/lib/styleIconsData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EXPLORE_ITEMS = [
  { icon: Sparkles, title: "Style Interview", desc: "Build your aesthetic identity", to: "/interview" },
  { icon: UserCircle, title: "Your Profile", desc: "Keywords, silhouettes, palette", to: "/profile" },
  { icon: ShoppingBag, title: "Suggested Items", desc: "Picks within your budget", to: "/foryou" },
  { icon: Shirt, title: "Your Closet", desc: "What you already own", to: "/closet" },
  { icon: CalendarDays, title: "Your Week Ahead", desc: "Outfits planned for the week", to: "/planner" },
  { icon: Info, title: "About Us", desc: "Our mission and why we built it", to: "/about" },
];

const Index = () => {
  const navigate = useNavigate();

  // Marquee row — duplicated for seamless loop
  const marqueeIcons = [...styleIcons, ...styleIcons];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 inset-x-0 z-20 px-6 lg:px-16 py-5 flex items-center justify-between">
        <span className="text-xs font-sans font-semibold tracking-[0.3em] uppercase text-foreground">
          Figure
        </span>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-sans uppercase tracking-[0.2em] rounded-none gap-1.5 text-foreground hover:text-foreground/70"
              >
                Explore
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-72 bg-background border border-border rounded-none p-2"
            >
              {EXPLORE_ITEMS.map((item) => (
                <DropdownMenuItem
                  key={item.to}
                  onSelect={() => navigate(item.to)}
                  className="flex items-start gap-3 px-3 py-3 cursor-pointer rounded-none focus:bg-card"
                >
                  <item.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-serif font-bold text-sm text-foreground leading-tight">
                      {item.title}
                    </span>
                    <span className="text-xs font-sans text-muted-foreground mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/auth")}
            className="text-xs font-sans uppercase tracking-[0.2em] rounded-none text-foreground hover:text-foreground/70"
          >
            Sign In
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/interview")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-sans uppercase tracking-[0.2em] rounded-none px-4"
          >
            Start Free
          </Button>
        </div>
      </header>

      {/* HERO — full-bleed centered */}
      <section className="min-h-screen bg-background flex flex-col items-center justify-center px-6 lg:px-16 text-center pt-20">
        <p className="text-[10px] md:text-xs font-sans font-semibold tracking-[0.3em] uppercase text-primary mb-6">
          AI Style Companion
        </p>
        <h1
          className="font-serif font-extrabold tracking-tight text-foreground leading-[0.95] text-5xl sm:text-6xl md:text-7xl lg:text-8xl max-w-4xl hyphens-none"
          style={{ wordBreak: "normal", overflowWrap: "normal", hyphens: "none" }}
        >
          Look Like Who You're Becoming.
        </h1>
        <p className="text-base md:text-lg font-sans font-light text-muted-foreground max-w-md leading-relaxed mt-8">
          A 7-minute style interview. A profile built around your body, life, and vision.
        </p>
        <div className="flex flex-col items-center gap-3 mt-10">
          <Button
            size="lg"
            onClick={() => navigate("/interview")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-xs font-sans font-semibold uppercase tracking-[0.25em] gap-3 group rounded-none"
          >
            Take the Style Interview
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-xs text-muted-foreground font-sans">Free · No account needed</p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 md:py-32 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 md:mb-20 gap-6">
            <div>
              <p className="text-[10px] md:text-xs font-sans font-semibold tracking-[0.3em] uppercase text-primary mb-4">
                How It Works
              </p>
              <h2 className="font-serif font-extrabold uppercase text-foreground leading-[0.88] tracking-tighter text-4xl md:text-6xl lg:text-7xl">
                Three steps. <span className="italic font-medium normal-case lowercase">That's it.</span>
              </h2>
            </div>
            <p className="text-muted-foreground font-sans text-sm md:text-base max-w-sm">
              No wardrobe audit. No selfie required. Just tell us who you want to be.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            {[
              {
                step: "01",
                title: "Drop your vibe",
                desc: "Tell us what energy you're going for. Mood words, inspo pics, whatever feels right.",
              },
              {
                step: "02",
                title: "We build your profile",
                desc: "AI creates your aesthetic identity: silhouettes, formality range, the whole thing.",
              },
              {
                step: "03",
                title: "Shop what fits",
                desc: "Real outfits, real links, filtered to your budget. Never something you can't afford.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col border-t border-border pt-6">
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="font-serif font-extrabold text-5xl md:text-6xl text-primary leading-none">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-serif font-bold uppercase text-foreground mb-3 leading-tight">
                  {item.title}
                </h3>
                <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STYLE ICONS — looping marquee */}
      <section className="py-16 md:py-24 bg-background border-b border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 mb-10 md:mb-14">
          <p className="text-[10px] md:text-xs font-sans font-semibold tracking-[0.3em] uppercase text-primary mb-4">
            Inspiration
          </p>
          <h2 className="font-serif font-extrabold text-foreground leading-[0.95] tracking-tight text-3xl md:text-4xl lg:text-5xl max-w-3xl">
            Styles we love.
          </h2>
        </div>

        <div
          className="relative w-full"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="flex gap-6 w-max animate-marquee">
            {marqueeIcons.map((icon, idx) => (
              <figure
                key={`${icon.id}-${idx}`}
                className="flex-shrink-0 w-44 md:w-56"
              >
                <div className="aspect-[3/4] overflow-hidden bg-card">
                  <img
                    src={icon.img}
                    alt={icon.name}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                </div>
                <figcaption className="pt-3">
                  <p className="font-serif font-bold text-foreground text-sm md:text-base leading-tight">
                    {icon.name}
                  </p>
                  <p className="text-[10px] md:text-xs font-sans uppercase tracking-[0.2em] text-muted-foreground mt-1">
                    {icon.from}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — dark close */}
      <section className="py-24 md:py-40 bg-foreground relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 lg:px-16 text-center relative z-10">
          <p className="text-[10px] md:text-xs font-sans font-semibold tracking-[0.3em] uppercase text-primary mb-8">
            Your Turn
          </p>
          <h2 className="font-serif font-extrabold uppercase text-background leading-[0.88] tracking-tighter text-5xl md:text-7xl mb-10">
            Your style era <span className="italic font-medium normal-case lowercase">starts now.</span>
          </h2>
          <p className="text-background/60 font-sans mb-12 max-w-md mx-auto text-base md:text-lg">
            Five minutes. Walk away with a style profile and fits you can actually buy.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/interview")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-7 text-xs font-sans font-semibold uppercase tracking-[0.25em] gap-3 group rounded-none"
          >
            Take the Style Interview
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border bg-background">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground font-sans uppercase tracking-[0.2em]">
            © 2026 Figure
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
