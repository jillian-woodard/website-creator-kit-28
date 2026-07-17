import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Compass,
  Wand2,
  ShoppingBasket,
  Shirt as ShirtIcon,
  Check,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

// The Discover -> Define -> Shop -> Wear product journey. Each stage maps to a real,
// existing part of the product (interview, profile, for-you, closet/planner) rather than
// being purely marketing copy.
const JOURNEY = [
  {
    icon: Compass,
    stage: "Discover",
    question: "Who do I want to become?",
    desc: "Start with inspiration, not inventory. Reference looks, visual preferences, a few honest questions.",
  },
  {
    icon: Wand2,
    stage: "Define",
    question: "What is my style, really?",
    desc: "Figure builds an evolving understanding of your taste from your answers, your closet, and your feedback.",
  },
  {
    icon: ShoppingBasket,
    stage: "Shop",
    question: "What should I actually buy?",
    desc: "Only pieces that genuinely fit your style, your budget, and your body. Every pick explains why.",
  },
  {
    icon: ShirtIcon,
    stage: "Wear",
    question: "How do I get more from what I own?",
    desc: "A digital wardrobe, trip planning, and outfits — built from what's already in your closet first.",
  },
];

// Illustrative "Figure has learned" checklist for the Style Understanding module. Maps
// directly to real style_profiles fields (ai_keywords, silhouette_type, budget range,
// evolving feedback signal) — this is what the section looks like once populated, not
// invented categories.
const LEARNED_EXAMPLES = [
  "You gravitate toward structured, tailored silhouettes",
  "Warm neutrals dominate almost everything you save",
  "You hold a consistent budget, $60 to $250 a piece",
  "You're getting more open to color than you were a month ago",
];

const Index = () => {
  const navigate = useNavigate();

  const scrollToJourney = () => {
    document.getElementById("journey")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* SECTION 1 — HERO */}
      <section className="px-6 lg:px-16 pt-14 md:pt-20 pb-20 md:pb-28">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-center">
          <div>
            <h1 className="font-serif font-medium text-foreground leading-[1.05] text-4xl sm:text-5xl md:text-6xl">
              Understand your style.
              <br />
              Shop with confidence.
            </h1>
            <p className="text-base md:text-lg font-sans font-light text-secondary max-w-md leading-relaxed mt-6">
              Figure helps you discover your personal style and recommends clothing you'll
              actually love — based on your aspirations, your body, your budget, and what you
              already own.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-10">
              <Button
                size="lg"
                onClick={() => navigate("/interview")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-sm font-sans rounded-full gap-2 group"
              >
                Find my style
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={scrollToJourney}
                className="text-sm font-sans text-secondary hover:text-foreground rounded-full px-4"
              >
                See how it works
              </Button>
            </div>
          </div>

          {/* Product mockup, not a photo — a live-look preview of the actual Style
              Understanding module, echoing how Linear/Arc/Apple show the product itself
              in the hero rather than a lifestyle image. */}
          <div className="relative pb-10 pl-10 md:pb-14 md:pl-14">
            <div className="bg-card border border-border rounded-3xl shadow-soft-lg p-7 md:p-9">
              <div className="flex items-center gap-2 mb-8">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-border" />
                  <span className="w-2.5 h-2.5 rounded-full bg-border" />
                  <span className="w-2.5 h-2.5 rounded-full bg-border" />
                </div>
                <p className="text-xs font-sans text-muted-foreground ml-2">Your style profile</p>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <p className="text-xs font-sans text-muted-foreground">Example</p>
                <p className="text-sm font-sans font-medium text-primary">91% understood</p>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-6">
                <div className="h-full bg-primary rounded-full" style={{ width: "91%" }} />
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {["Quiet luxury", "Parisian", "Relaxed tailoring"].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-sans px-3 py-1.5 rounded-full bg-muted text-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="border-t border-border pt-6 space-y-3">
                {["Structured silhouettes suit you", "You invest in timeless basics"].map(
                  (line) => (
                    <div
                      key={line}
                      className="flex items-start gap-2.5 text-sm font-sans text-secondary"
                    >
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      {line}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Layered secondary card, offset bottom-left */}
            <div className="hidden md:block absolute bottom-0 left-0 bg-background border border-border rounded-2xl shadow-soft-lg p-5 w-56">
              <p className="text-xs font-sans text-muted-foreground mb-1.5">Recommended</p>
              <p className="font-serif text-sm text-foreground mb-2 leading-snug">
                COS wool-blend blazer
              </p>
              <span className="text-xs font-sans px-2.5 py-1 rounded-full bg-muted text-foreground">
                Best match
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — THE PROBLEM */}
      <section className="px-6 lg:px-16 py-20 md:py-28 bg-card border-y border-border">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-serif text-2xl md:text-4xl text-foreground leading-snug">
            You have Pinterest boards. Saved reels. A closet full of clothes you don't quite
            wear. And somehow, you still don't know what to buy next.
          </p>
          <p className="text-secondary font-sans mt-8 leading-relaxed">
            Figure starts one step earlier — with who you're trying to become, not what's
            already in stock.
          </p>
        </div>
      </section>

      {/* SECTION 3 — THE JOURNEY */}
      <section id="journey" className="px-6 lg:px-16 py-20 md:py-28 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14 md:mb-16 max-w-xl">
            <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-4">
              How it works
            </p>
            <h2 className="font-serif font-medium text-foreground text-3xl md:text-4xl leading-tight">
              From aspiration to your actual closet.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {JOURNEY.map((step) => (
              <div
                key={step.stage}
                className="bg-card border border-border rounded-3xl p-6 shadow-soft flex flex-col"
              >
                <div className="flex items-center gap-2 mb-5">
                  <step.icon className="w-4 h-4 text-primary" />
                  <p className="text-xs font-sans uppercase tracking-[0.16em] text-muted-foreground">
                    {step.stage}
                  </p>
                </div>
                <h3 className="font-serif text-lg text-foreground mb-2 leading-snug">
                  {step.question}
                </h3>
                <p className="text-sm text-secondary font-sans leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — STYLE UNDERSTANDING (emotional centerpiece) */}
      <section className="px-6 lg:px-16 py-20 md:py-28 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-4 text-center">
            Figure's understanding
          </p>
          <h2 className="font-serif font-medium text-foreground text-3xl md:text-4xl leading-tight mb-14 text-center">
            The goal isn't more options. It's feeling understood.
          </h2>

          <div className="bg-background border border-border rounded-3xl shadow-soft-lg p-8 md:p-12">
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-xs font-sans text-muted-foreground">Example — current style</p>
              <p className="text-sm font-sans font-medium text-primary">91% understood</p>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-8">
              <div className="h-full bg-primary rounded-full" style={{ width: "91%" }} />
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {["Quiet luxury", "Parisian", "Relaxed tailoring"].map((tag) => (
                <span
                  key={tag}
                  className="text-sm font-sans px-4 py-1.5 rounded-full bg-muted text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-xs font-sans text-muted-foreground mb-4">Figure has learned</p>
            <ul className="space-y-3 mb-8">
              {LEARNED_EXAMPLES.map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm font-sans text-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  {line}
                </li>
              ))}
            </ul>

            <Button
              variant="ghost"
              onClick={() => navigate("/profile")}
              className="text-sm font-sans text-primary hover:text-primary/80 gap-2 px-0 hover:bg-transparent"
            >
              Improve my style
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 5 — ONE RECOMMENDATION, EXPLAINED */}
      <section className="px-6 lg:px-16 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-4 text-center">
            Recommendations, explained
          </p>
          <h2 className="font-serif font-medium text-foreground text-3xl md:text-4xl leading-tight mb-14 text-center">
            Every pick comes with a reason.
          </h2>

          <div className="bg-card border border-border rounded-3xl shadow-soft-lg overflow-hidden grid sm:grid-cols-[1fr_1.2fr]">
            <div className="aspect-[4/5] sm:aspect-auto bg-muted flex items-center justify-center">
              <ShirtIcon className="w-14 h-14 text-primary/30" strokeWidth={1.25} />
            </div>
            <div className="p-8 flex flex-col">
              <p className="text-xs font-sans text-muted-foreground mb-2">Example recommendation</p>
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="font-serif text-xl text-foreground">COS wool-blend blazer</h3>
              </div>
              <span className="inline-block w-fit text-xs font-sans px-3 py-1 rounded-full bg-muted text-foreground mb-6">
                Best match
              </span>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  "Fits your style",
                  "Fits your budget",
                  "Works with 11 pieces you already own",
                  "Right for your upcoming trip",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2.5 text-sm font-sans text-secondary">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    {line}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => navigate("/for-you")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-sans text-sm w-fit gap-2"
              >
                See your picks
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — WARDROBE INTELLIGENCE */}
      <section className="px-6 lg:px-16 py-20 md:py-28 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-4 text-center">
            Beyond shopping
          </p>
          <h2 className="font-serif font-medium text-foreground text-3xl md:text-4xl leading-tight mb-14 text-center">
            Your closet is intelligence, not storage.
          </h2>

          <div className="bg-background border border-border rounded-3xl shadow-soft p-8 md:p-12 grid sm:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-sans text-muted-foreground mb-4">Example — wardrobe insight</p>
              <p className="text-sm font-sans text-foreground mb-2">You already own</p>
              <ul className="space-y-1.5 text-sm font-sans text-secondary">
                <li>14 tops</li>
                <li>9 bottoms</li>
                <li>1 blazer</li>
              </ul>
            </div>
            <div className="sm:border-l sm:border-border sm:pl-10">
              <p className="font-serif text-xl text-foreground leading-snug mb-6">
                A neutral blazer would unlock about 18 new outfits from what's already in your
                closet.
              </p>
              <Button
                variant="ghost"
                onClick={() => navigate("/closet")}
                className="text-sm font-sans text-primary hover:text-primary/80 gap-2 px-0 hover:bg-transparent"
              >
                See my closet
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — FINAL CTA */}
      <section className="px-6 lg:px-16 py-24 md:py-32 bg-foreground">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif font-medium text-background text-3xl md:text-5xl leading-tight mb-10">
            Your style already exists.
            <br />
            Figure helps you understand it.
          </h2>
          <Button
            size="lg"
            onClick={() => navigate("/interview")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-sm font-sans rounded-full gap-2 group"
          >
            Find my style
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border bg-background">
        <div className="container mx-auto px-6 text-center flex items-center justify-center gap-6 flex-wrap">
          <p className="text-xs text-muted-foreground font-sans">© 2026 Figure</p>
          <a href="/about" className="text-xs text-muted-foreground font-sans hover:text-foreground transition-colors">About</a>
          <a href="/terms" className="text-xs text-muted-foreground font-sans hover:text-foreground transition-colors">Terms</a>
          <a href="/privacy" className="text-xs text-muted-foreground font-sans hover:text-foreground transition-colors">Privacy</a>
        </div>
      </footer>
    </div>
  );
};

export default Index;
