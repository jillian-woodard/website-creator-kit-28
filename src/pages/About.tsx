import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, UserCircle, ShoppingBag, Shirt, CalendarDays, ChevronDown, Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EXPLORE_ITEMS = [
  { icon: Sparkles, title: "Style Interview", desc: "Build your aesthetic identity", to: "/interview" },
  { icon: UserCircle, title: "Your Profile", desc: "Keywords, silhouettes, palette", to: "/profile" },
  { icon: ShoppingBag, title: "Suggested Items", desc: "Picks within your budget", to: "/for-you" },
  { icon: Shirt, title: "Your Closet", desc: "What you already own", to: "/closet" },
  { icon: CalendarDays, title: "Your Week Ahead", desc: "Outfits planned for the week", to: "/planner" },
  { icon: Info, title: "About Us", desc: "Our mission and why we built it", to: "/about" },
];

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 inset-x-0 z-20 px-6 lg:px-16 py-5 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="text-xs font-sans font-semibold tracking-[0.3em] uppercase text-foreground"
        >
          Figure
        </button>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-sans uppercase tracking-[0.2em] rounded-none gap-1.5"
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
            className="text-xs font-sans uppercase tracking-[0.2em] rounded-none"
          >
            Sign In
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/auth?mode=signup")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-sans uppercase tracking-[0.2em] rounded-none px-4"
          >
            Sign Up
          </Button>
        </div>
      </header>

      {/* BLOCK 1 — ABOUT US */}
      <section className="pt-32 md:pt-40 pb-20 md:pb-32 bg-background">
        <div className="max-w-4xl mx-auto px-6 lg:px-16">
          <p className="text-[10px] md:text-xs font-sans font-semibold tracking-[0.3em] uppercase text-primary/70 mb-6">
            About Us
          </p>
          <h1 className="font-serif font-extrabold text-foreground leading-[0.95] tracking-tight text-4xl md:text-5xl lg:text-6xl mb-12 md:mb-16">
            Style is one of the most confidence-driving investments a person can make. Most people don&apos;t know how to do it for themselves.
          </h1>
          <div className="space-y-6 max-w-2xl">
            <p className="text-base md:text-lg font-sans text-muted-foreground leading-relaxed">
              55% of a first impression is visual, and it forms in under 0.1 seconds. But most people don&apos;t have a stylist. The humans who do it well charge $150 to $500 per session. The apps that exist start with your wardrobe or your selfie. The feeds you scroll will show you outfits all day, but only after you&apos;ve already decided whose closet you want. Most people haven&apos;t.
            </p>
            <p className="text-base md:text-lg font-sans text-muted-foreground leading-relaxed">
              That&apos;s why I&apos;m building Figure: an AI stylist that starts with aspiration, accounts for your body, and ends with clothes you can actually buy.
            </p>
          </div>
          <p className="mt-12 md:mt-16 font-serif font-bold italic text-foreground text-2xl md:text-3xl leading-snug max-w-2xl">
            You define the look. We figure out the fits.
          </p>
        </div>
      </section>

      {/* BLOCK 2 — OUR MISSION */}
      <section className="py-20 md:py-32 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto px-6 lg:px-16">
          <p className="text-[10px] md:text-xs font-sans font-semibold tracking-[0.3em] uppercase text-primary/70 mb-6">
            Our Mission
          </p>
          <h2 className="font-serif font-extrabold text-foreground leading-[0.95] tracking-tight text-4xl md:text-5xl lg:text-6xl mb-12 md:mb-16">
            Most styling tools call themselves personalized. We actually start with you.
          </h2>
          <div className="space-y-6 max-w-2xl mb-16 md:mb-20">
            <p className="text-base md:text-lg font-sans text-muted-foreground leading-relaxed">
              Every existing product begins with inventory or biology: your closet, your selfie, your browsing history. None of them ask the question that actually matters. We flipped the script.
            </p>
            <p className="text-base md:text-lg font-sans text-muted-foreground leading-relaxed">
              At Figure, we start with aspiration. You set your budget upfront. Everything you see fits inside it. You should never be shown a silhouette that wasn&apos;t designed with your body in mind.
            </p>
          </div>

          <blockquote className="max-w-3xl border-l-2 border-primary/40 pl-6 md:pl-8">
            <p className="text-xl md:text-3xl font-serif font-light italic text-foreground leading-snug">
              &ldquo;96% of women say what they wear directly affects how confident they feel.&rdquo;
            </p>
            <cite className="text-[10px] md:text-xs font-sans uppercase tracking-[0.25em] text-muted-foreground mt-4 block not-italic">
              Professor Karen Pine, University of Hertfordshire
            </cite>
          </blockquote>
        </div>
      </section>

      {/* The Science */}
      <section className="py-20 md:py-32 bg-background text-center">
        <div className="max-w-3xl mx-auto px-6 lg:px-16">
          <p className="text-[10px] md:text-xs font-sans font-semibold tracking-[0.3em] uppercase text-primary/70 mb-6">
            The Science
          </p>
          <blockquote className="text-xl md:text-3xl font-serif text-foreground leading-snug mb-6">
            &ldquo;What you wear changes how you think. Researchers call it
            <span className="text-primary"> enclothed cognition</span>:
            clothing doesn&apos;t just reflect identity, it shapes it.&rdquo;
          </blockquote>
          <cite className="text-xs md:text-sm font-sans text-muted-foreground not-italic">
            Adam &amp; Galinsky · Journal of Experimental Social Psychology, 2012
          </cite>
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

export default About;
