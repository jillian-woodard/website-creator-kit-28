import { useStyle } from "@/lib/styleContext";
import { Check } from "lucide-react";

const OCCASIONS = [
  "Workwear",
  "Everyday",
  "Date Night",
  "Weddings",
  "Vacations",
  "Going Out",
  "Activewear",
  "Loungewear",
];

const OccasionsStep = () => {
  const { data, updateData } = useStyle();

  const occasions = data.occasions ?? [];

  const toggle = (occasion: string) => {
    if (occasions.includes(occasion)) {
      updateData({ occasions: occasions.filter((o) => o !== occasion) });
    } else {
      updateData({ occasions: [...occasions, occasion] });
    }
  };

  const isSelected = (o: string) => occasions.includes(o);

  return (
    <div>
      <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-3 font-sans">
        Step 5
      </p>
      <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-3">
        What do you dress for?
      </h2>
      <p className="text-muted-foreground font-sans font-light mb-4 max-w-lg">
        Pick the occasions that fill most of your week. We'll tailor your picks and weekly plans to match.
      </p>
      <p className="text-xs text-muted-foreground/70 font-sans mb-8">
        {occasions.length} selected
      </p>

      <div className="flex flex-wrap gap-3">
        {OCCASIONS.map((occasion) => (
          <button
            key={occasion}
            onClick={() => toggle(occasion)}
            className={`px-5 py-2.5 text-sm font-sans rounded-full border-2 transition-all flex items-center gap-2 ${
              isSelected(occasion)
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {isSelected(occasion) && <Check className="w-3.5 h-3.5 text-primary" />}
            {occasion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OccasionsStep;
