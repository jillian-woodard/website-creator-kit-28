import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import { ArrowLeft } from "lucide-react";
import {
  womenBodyTypes,
  menBodyTypes,
  shortMenTips,
  universalRules,
  type BodyTypeInfo,
  type ShortMenTip,
} from "@/lib/bodyTypeData";

const tabs = [
  { id: "women", label: "Women" },
  { id: "men", label: "Men" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const ShapeCard = ({ item }: { item: BodyTypeInfo | ShortMenTip; highlight?: boolean }) => {
  const isHighlight = "highlight" in item && item.highlight;
  return (
    <div
      className={`bg-card border rounded-xl p-5 transition-all ${
        isHighlight ? "border-primary/40 ring-1 ring-primary/10" : "border-border"
      }`}
    >
      <h3 className="font-serif text-[15px] text-foreground mb-2">{item.name}</h3>
      <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">{item.desc}</p>

      <div className="flex gap-2 mb-2 items-start">
        <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-primary min-w-[40px] pt-0.5 shrink-0">
          {isHighlight ? "Do" : "Wear"}
        </span>
        <span className="text-[13px] text-foreground leading-relaxed">{item.wear}</span>
      </div>
      <div className="flex gap-2 items-start">
        <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-destructive min-w-[40px] pt-0.5 shrink-0">
          {isHighlight ? "Don't" : "Skip"}
        </span>
        <span className="text-[13px] text-foreground leading-relaxed">{item.skip}</span>
      </div>
    </div>
  );
};

const Guide = () => {
  const [active, setActive] = useState<TabId>("women");
  const navigate = useNavigate();

  const bodyTypes = active === "women" ? womenBodyTypes : menBodyTypes;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="font-serif text-lg text-foreground">Body Type Guide</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-16 max-w-4xl py-12">
        {/* Hero */}
        <div className="text-center mb-10 pb-8 border-b border-border">
          <h1 className="font-serif text-3xl md:text-5xl text-foreground mb-3 tracking-tight">
            Shop What Fits
          </h1>
          <p className="text-muted-foreground font-sans font-light text-[15px] max-w-md mx-auto leading-relaxed">
            A practical reference for dressing your shape — for women and men, with height-specific guidance included.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`px-5 py-2 text-sm font-sans font-medium rounded-full border transition-all ${
                active === tab.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Short men note */}
        {active === "men" && (
          <div className="bg-secondary/20 border border-secondary/40 rounded-lg px-5 py-4 mb-6 flex gap-3 items-start">
            <span className="text-[11px] font-sans font-medium text-primary uppercase tracking-wider whitespace-nowrap pt-0.5 shrink-0">
              Note
            </span>
            <span className="text-[13px] text-foreground leading-relaxed">
              Height-specific guidance for shorter men is included below the body shapes. "Short" is generally considered 5'7" and under in the US — the average American man is 5'9".
            </span>
          </div>
        )}

        {/* Body type cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {bodyTypes.map((item) => (
            <ShapeCard key={item.id} item={item} />
          ))}
        </div>

        {/* Short men section */}
        {active === "men" && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4 pt-2 border-t border-border">
              <p className="font-serif text-lg text-foreground italic">Short men</p>
              <span className="text-xs text-muted-foreground pt-0.5">5'7" and under</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {shortMenTips.map((item) => (
                <ShapeCard key={item.name} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Universal rules */}
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="font-serif text-lg text-foreground italic mb-4 pb-3 border-b border-border">
            Universal rules — apply to everyone
          </p>
          <ul className="space-y-0">
            {universalRules.map((rule, i) => (
              <li
                key={i}
                className={`text-[13.5px] text-muted-foreground py-3 leading-relaxed flex gap-3 items-start ${
                  i < universalRules.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Guide;
