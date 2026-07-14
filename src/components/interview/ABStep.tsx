import { useState } from "react";
import { useStyle } from "@/lib/styleContext";


interface ABPair {
  id: number;
  optionA: { label: string; desc: string };
  optionB: { label: string; desc: string };
}

const abPairs: ABPair[] = [
  {
    id: 1,
    optionA: { label: "Quiet Luxury", desc: "Understated, neutral palettes, investment pieces" },
    optionB: { label: "Bold Expression", desc: "Statement pieces, rich colors, pattern play" },
  },
  {
    id: 2,
    optionA: { label: "Minimalist Structure", desc: "Clean lines, architectural cuts, monochrome" },
    optionB: { label: "Relaxed Flow", desc: "Soft draping, natural fabrics, effortless layers" },
  },
  {
    id: 3,
    optionA: { label: "Classic Tailoring", desc: "Blazers, trousers, polished silhouettes" },
    optionB: { label: "Streetwear Edge", desc: "Sneakers, oversized fits, urban influence" },
  },
  {
    id: 4,
    optionA: { label: "Warm Earth Tones", desc: "Camel, olive, terracotta, cream" },
    optionB: { label: "Cool Monochromes", desc: "Black, white, grey, navy" },
  },
  {
    id: 5,
    optionA: { label: "Day-to-Night", desc: "Versatile pieces that transition across occasions" },
    optionB: { label: "Occasion-Specific", desc: "Distinct wardrobes for work, weekend, events" },
  },
];

const ABStep = () => {
  const { data, updateData } = useStyle();
  const [currentPair, setCurrentPair] = useState(0);

  const choose = (choice: 0 | 1) => {
    const newChoices = [...data.abChoices, choice];
    updateData({ abChoices: newChoices });
    if (currentPair < abPairs.length - 1) {
      setCurrentPair(currentPair + 1);
    }
  };

  const pair = abPairs[currentPair];
  const completed = data.abChoices.length;

  return (
    <div>
      <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-3 font-sans">
        Step 4
      </p>
      <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-3">
        Quick preferences.
      </h2>
      <p className="text-muted-foreground font-sans font-light mb-8 max-w-lg">
        Pick the one that speaks to you. No wrong answers. This sharpens your profile.
      </p>

      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {abPairs.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < completed ? "bg-primary" : i === currentPair ? "bg-primary/40" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {currentPair < abPairs.length ? (
        <div className="grid sm:grid-cols-2 gap-4" key={pair.id}>
          {[pair.optionA, pair.optionB].map((option, idx) => (
            <button
              key={idx}
              onClick={() => choose(idx as 0 | 1)}
              className="group relative overflow-hidden rounded-lg border border-border bg-card p-8 text-left hover:border-primary/40 transition-all hover:shadow-lg"
            >
              <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary/20 to-accent/10" />
              <div className="relative z-10">
                <h3 className="font-serif text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                  {option.label}
                </h3>
                <p className="text-sm text-muted-foreground font-sans font-light">
                  {option.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-primary/20 rounded-lg p-10 text-center">
          <p className="font-serif text-2xl text-foreground mb-2">Profile sharpened ✓</p>
          <p className="text-muted-foreground font-sans text-sm">
            Your preferences are locked in. Continue to see your style profile.
          </p>
        </div>
      )}
    </div>
  );
};

export default ABStep;
