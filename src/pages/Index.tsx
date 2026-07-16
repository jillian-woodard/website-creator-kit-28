import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  UserCircle,
  ShoppingBag,
  Shirt,
  CalendarDays,
  ChevronDown,
  Info,
  Compass,
  Wand2,
  ShoppingBasket,
  Shirt as ShirtIcon,
} from "lucide-react";
import { styleIcons } from "@/lib/styleIconsData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EXPLORE_ITEMS = [
  { icon: Sparkles, title: "Style interview", desc: "Build your aesthetic identity", to: "/interview" },
  { icon: UserCircle, title: "My style", desc: "Keywords, silhouettes, palette", to: "/profile" },
  { icon: ShoppingBag, title: "For you", desc: "Curated picks within your budget", to: "/for-you" },
  { icon: Shirt, title: "My closet", desc: "Build new outfits from what you own", to: "/closet" },
  { icon: CalendarDays, title: "Trip planning", desc: "Outfits planned ahead", to: "/planner" },
  { icon: Info, title: "About us", desc: "Our mission and why we built it", to: "/about" },
];

// The Discover -> Define -> Shop -> Wear product journey. Each stage maps to a real,
// existing part of the product (interview, profile, for-you, closet/planner) rather than
// being purely marketing copy.
const JOURNEY = [
  {
    icon: Compass,
    stage: "Discover",
    title: "Find what resonates",
    desc: "Explore real style references and reference looks until something clicks. No mood boards required.",
  },
  {
    icon: Wand2,
    stage: "Define",
    title: "Understand your style",
    desc: "We translate what you're drawn to into a real style profile: silhouettes, palette, formality range, budget.",
  },
  {
    icon: ShoppingBasket,
    stage: "Shop",
    title: "See picks that make sense",
    desc: "Every recommendation comes with a reason it was chosen, from real retailers, inside your budget.",
  },
  {
    icon: ShirtIcon,
    stage: "Wear",
    title: "Actually wear it",
    desc: "Your closet becomes part of the system: what you own shapes what gets suggested next, and what to pack.",
  },
];

// Illustrative examples of the "why this was picked" reasoning the recommendation engine
// actually uses (aesthetic-tag overlap + budget fit), paired with real style photography
// already on the site rather than stock or synthetic images.
const WHY_EXAMPLES = [
  {
    icon: styleIcons.find((i) => i.id === "aylin"),
    tag: "Classic & Tailored",
    reason: "Matches your tailored, minimal silhouette and sits inside your everyday budget.",
  },
  {
    icon: styleIcons.find((i) => i.id === "camila"),
    tag: "Red Carpet & Editorial",
    reason: "Picked for the polished, editorial finish you responded to during your interview.",
  },
  {
    icon: styleIcons.find((i) => i.id === "carol"),
    tag: "Streetwear & Casual",
    reason: "An effortless, casual piece from a brand you've saved from before.",
  },
].filter((e) => e.icon);

const PILLARS = [
  {
    title: "Aspiration first",
    desc: "We start with who you're becoming, not a warehouse of inventory to sort through.",
  },
  {
    title: "Real recommendations",
    desc: "Every piece is a real, shoppable product from a real retailer, matched to your actual budget.",
  },
  {
    title: "Fewer, better decisions",
    desc: "Less scrolling, less second-guessing. A shortlist you can actually act on.",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const marqueeIcons = [...styleIcons, ...styleIcons];
  const heroIcons = styleIcons.slice(0, 3);

  const scrollToJourney = () => {
    document.getElementById("journey")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border px-6 lg:px-16 py-5 flex items-center justify-between">
        <span className="text-sm font-serif font-medium tracking-tight text-foreground">
          Figure
        </span>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-sans text-secondary hover:text-foreground gap-1.5 rounded-full"
              >
                Explore
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-72 bg-card border border-border rounded-2xl p-2 shadow-soft-lg"
            >
              {EXPLORE_ITEMS.map((item) => (
                <DropdownMenuItem
                  key={item.to}
                  onSelect={() => navigate(item.to)}
                  className="flex items-start gap-3 px-3 py-3 cursor-pointer rounded-xl focus:bg-muted"
                >
                  <item.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-serif text-sm text-foreground leading-tight">
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
            className="text-sm font-sans text-secondary hover:text-foreground rounded-full"
          >
            Sign in
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/interview")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-sans rounded-full px-5"
          >
            Start free
          </Button>
        </div>
      </header>

      {/* HERO */}
      <section className="px-6 lg:px-16 pt-16 md:pt-24 pb-20 md:pb-28">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-14 lg:gap-20 items-center">
          <div>
            <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-6">
              A personal styling companion
            </p>
            <h1 className="font-serif font-medium text-foreground leading-[1.05] text-4xl sm:text-5xl md:text-6xl max-w-xl">
              Understand your style.
              <br />
              Shop with confidence.
            </h1>
            <p className="text-base md:text-lg font-sans font-light text-secondary max-w-md leading-relaxed mt-6">
              Figure helps you define your taste before you spend a dollar on it, then shows you
              real, shoppable pieces that actually fit who you're becoming.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-10">
              <Button
                size="lg"
                onClick={() => navigate("/interview")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-sm font-sans rounded-full gap-2 group"
              >
                Start your style profile
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
            <p className="text-xs text-muted-foreground font-sans mt-4">Free · No account needed to start</p>
          </div>

          {/* Editorial image collage — real style photography already on the site */}
          <div className="relative h-[420px] md:h-[480px] hidden sm:block">
            <div className="absolute top-0 right-6 w-[62%] aspect-[3/4] rounded-3xl overflow-hidden shadow-soft-lg">
              <img
                src={heroIcons[0]?.img}
                alt={heroIcons[0]?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-0 w-[46%] aspect-[3/4] rounded-3xl overflow-hidden shadow-soft-lg border-4 border-background">
              <img
                src={heroIcons[1]?.img}
                alt={heroIcons[1]?.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* STYLE UNDERSTANDING MODULE */}
      <section className="px-6 lg:px-16 py-20 md:py-28 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-4">
              The core of Figure
            </p>
            <h2 className="font-serif font-medium text-foreground text-3xl md:text-4xl leading-tight mb-5">
              Style understanding, not just a profile.
            </h2>
            <p className="text-secondary font-sans leading-relaxed max-w-md mb-6">
              Most tools ask what you already own or what you clicked on last. Figure starts
              earlier — with a short interview about the way you actually want to look and live
              in your clothes. That becomes "My Style": a living reference Figure checks every
              recommendation against.
            </p>
            <Button
              variant="ghost"
              onClick={() => navigate("/interview")}
              className="text-sm font-sans text-primary hover:text-primary/80 gap-2 px-0 hover:bg-transparent"
            >
              Build my style profile
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="bg-background border border-border rounded-3xl p-6 md:p-8 shadow-soft">
            <p className="text-xs font-sans uppercase tracking-[0.18em] text-muted-foreground mb-5">
              My style — example
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {["Minimalist", "Effortless", "Polished"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-sans px-3 py-1.5 rounded-full bg-muted text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-t border-border pt-4">
                <span className="text-sm font-sans text-muted-foreground">Silhouette</span>
                <span className="text-sm font-sans text-foreground">Structured, clean lines</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-4">
                <span className="text-sm font-sans text-muted-foreground">Budget per piece</span>
                <span className="text-sm font-sans text-foreground">$60–250</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-4">
                <span className="text-sm font-sans text-muted-foreground">Dress for</span>
                <span className="text-sm font-sans text-foreground">Everyday, going out</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JOURNEY: Discover -> Define -> Shop -> Wear */}
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
            {JOURNEY.map((step, idx) => (
              <div
                key={step.stage}
                className="bg-card border border-border rounded-3xl p-6 shadow-soft flex flex-col"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-6">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-sans uppercase tracking-[0.16em] text-muted-foreground mb-2">
                  {String(idx + 1).padStart(2, "0")} · {step.stage}
                </p>
                <h3 className="font-serif text-lg text-foreground mb-2 leading-snug">
                  {step.title}
                </h3>
                <p className="text-sm text-secondary font-sans leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY THIS WAS PICKED */}
      <section className="px-6 lg:px-16 py-20 md:py-28 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div className="max-w-lg">
              <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-4">
                Recommendations, explained
              </p>
              <h2 className="font-serif font-medium text-foreground text-3xl md:text-4xl leading-tight">
                Every pick comes with a reason.
              </h2>
            </div>
            <p className="text-secondary font-sans text-sm md:text-base max-w-sm">
              No black box. You'll always see why something showed up, so it's easier to trust
              and faster to decide.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_EXAMPLES.map((ex) => (
              <div
                key={ex.tag}
                className="bg-background border border-border rounded-3xl overflow-hidden shadow-soft"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={ex.icon!.img}
                    alt={ex.icon!.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="p-5">
                  <span className="inline-block text-xs font-sans px-3 py-1 rounded-full bg-muted text-foreground mb-3">
                    {ex.tag}
                  </span>
                  <p className="text-sm font-sans text-secondary leading-relaxed">
                    <span className="text-foreground font-medium">Why this was picked: </span>
                    {ex.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Button
              variant="ghost"
              onClick={() => navigate("/for-you")}
              className="text-sm font-sans text-primary hover:text-primary/80 gap-2 px-0 hover:bg-transparent"
            >
              See your picks
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* WARDROBE + TRIP PLANNING PREVIEW */}
      <section className="px-6 lg:px-16 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14 max-w-xl">
            <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-4">
              Beyond shopping
            </p>
            <h2 className="font-serif font-medium text-foreground text-3xl md:text-4xl leading-tight">
              Your closet is part of the system.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-soft flex flex-col">
              <Shirt className="w-6 h-6 text-primary mb-6" />
              <h3 className="font-serif text-xl text-foreground mb-3">My closet</h3>
              <p className="text-sm text-secondary font-sans leading-relaxed mb-6 flex-1">
                What you already own shapes what gets suggested next. One well-chosen blazer can
                unlock two dozen outfits you hadn't put together yet — Figure surfaces those
                combinations instead of leaving them buried in your closet.
              </p>
              <Button
                variant="ghost"
                onClick={() => navigate("/closet")}
                className="text-sm font-sans text-primary hover:text-primary/80 gap-2 px-0 hover:bg-transparent w-fit"
              >
                Mix my closet
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 shadow-soft flex flex-col">
              <CalendarDays className="w-6 h-6 text-primary mb-6" />
              <h3 className="font-serif text-xl text-foreground mb-3">Trip planning</h3>
              <p className="text-sm text-secondary font-sans leading-relaxed mb-6 flex-1">
                Planning ahead starts with what's already in your closet. Figure builds outfits
                from pieces you own first, and only recommends buying something new to fill an
                actual gap.
              </p>
              <Button
                variant="ghost"
                onClick={() => navigate("/planner")}
                className="text-sm font-sans text-primary hover:text-primary/80 gap-2 px-0 hover:bg-transparent w-fit"
              >
                Plan your week
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* STYLE ICONS — looping marquee, kept as real-photography inspiration */}
      <section className="py-16 md:py-24 bg-card border-y border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 mb-10 md:mb-14">
          <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-4">
            Inspiration
          </p>
          <h2 className="font-serif font-medium text-foreground text-3xl md:text-4xl leading-tight max-w-md">
            Styles we love.
          </h2>
          <p className="text-secondary font-sans text-sm md:text-base max-w-md mt-3">
            We don't copy their outfit. We translate it onto your body, your budget, your taste.
          </p>
        </div>

        <div
          className="relative w-full"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="flex gap-5 w-max animate-marquee">
            {marqueeIcons.map((icon, idx) => (
              <figure key={`${icon.id}-${idx}`} className="flex-shrink-0 w-40 md:w-52">
                <div className="aspect-[3/4] overflow-hidden bg-muted rounded-2xl">
                  <img
                    src={icon.img}
                    alt={icon.name}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                </div>
                <figcaption className="pt-3">
                  <p className="font-serif text-foreground text-sm leading-tight">{icon.name}</p>
                  <p className="text-[11px] font-sans uppercase tracking-[0.14em] text-muted-foreground mt-1">
                    {icon.from}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* WHY FIGURE — 3 pillars */}
      <section className="px-6 lg:px-16 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14 max-w-xl">
            <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-4">
              Why Figure
            </p>
            <h2 className="font-serif font-medium text-foreground text-3xl md:text-4xl leading-tight">
              Not another shopping app.
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 md:gap-10">
            {PILLARS.map((pillar) => (
              <div key={pillar.title} className="border-t border-border pt-6">
                <h3 className="font-serif text-lg text-foreground mb-3">{pillar.title}</h3>
                <p className="text-sm text-secondary font-sans leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSE CTA */}
      <section className="px-6 lg:px-16 py-24 md:py-32 bg-foreground">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif font-medium text-background text-3xl md:text-5xl leading-tight mb-6">
            Your style era starts now.
          </h2>
          <p className="text-background/60 font-sans mb-10 text-base md:text-lg">
            Seven minutes. Walk away with a style profile and picks you can actually buy.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/interview")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-sm font-sans rounded-full gap-2 group"
          >
            Take the style interview
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
