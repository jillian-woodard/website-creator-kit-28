import { useStyle } from "@/lib/styleContext";

const OPTIONS = [
  { id: "mens", label: "Men's", desc: "Recommend menswear" },
  { id: "womens", label: "Women's", desc: "Recommend womenswear" },
  { id: "nonbinary", label: "Non-binary", desc: "Unisex pieces, no gendered styling" },
  { id: "both", label: "Both", desc: "Mixed results across menswear and womenswear" },
] as const;

const ShoppingPreferenceStep = () => {
  const { data, updateData } = useStyle();

  return (
    <div>
      <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-3 font-sans">
        Step 4
      </p>
      <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-3">
        What do you want to shop for?
      </h2>
      <p className="text-muted-foreground font-sans font-light mb-8 max-w-lg">
        This shapes every recommendation we make for you.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {OPTIONS.map((opt) => {
          const active = data.shoppingPreference === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => updateData({ shoppingPreference: opt.id })}
              className={`p-6 rounded-lg border text-left transition-all ${
                active
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <p className="font-sans font-medium text-foreground">{opt.label}</p>
              <p className="text-xs text-muted-foreground font-sans mt-1">{opt.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ShoppingPreferenceStep;
