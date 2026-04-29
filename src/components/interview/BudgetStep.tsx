import { useStyle, SHOPPING_CATEGORIES, CategoryBudget } from "@/lib/styleContext";
import { Slider } from "@/components/ui/slider";
import { Check } from "lucide-react";

const PRESETS: { label: string; min: number; max: number }[] = [
  { label: "Under $50", min: 10, max: 50 },
  { label: "$50–$150", min: 50, max: 150 },
  { label: "$100–$300", min: 100, max: 300 },
  { label: "$200+", min: 200, max: 1000 },
];

const BudgetStep = () => {
  const { data, updateData } = useStyle();
  const budgets = data.categoryBudgets ?? {};

  const update = (cat: string, patch: Partial<CategoryBudget>) => {
    const current = budgets[cat] ?? { enabled: false, min: 50, max: 200 };
    updateData({
      categoryBudgets: {
        ...budgets,
        [cat]: { ...current, ...patch },
      },
    });
  };

  const toggleCategory = (cat: string) => {
    const current = budgets[cat] ?? { enabled: false, min: 50, max: 200 };
    update(cat, { enabled: !current.enabled });
  };

  const enabledCount = Object.values(budgets).filter((b) => b?.enabled).length;

  return (
    <div>
      <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-3 font-sans">
        Step 5
      </p>
      <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-3">
        What are you shopping for?
      </h2>
      <p className="text-muted-foreground font-sans font-light mb-4 max-w-lg">
        Pick the categories you want to invest in, and set a price range for each. We'll only surface pieces that fit.
      </p>
      <p className="text-xs text-muted-foreground/70 font-sans mb-8">
        {enabledCount} {enabledCount === 1 ? "category" : "categories"} selected
      </p>

      <div className="space-y-4">
        {SHOPPING_CATEGORIES.map((cat) => {
          const b = budgets[cat] ?? { enabled: false, min: 50, max: 200 };
          return (
            <div
              key={cat}
              className={`bg-card rounded-lg border transition-colors ${
                b.enabled ? "border-primary/40" : "border-border"
              }`}
            >
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      b.enabled ? "bg-primary border-primary" : "border-border"
                    }`}
                  >
                    {b.enabled && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                  </div>
                  <span className="text-lg font-serif text-foreground">{cat}</span>
                </div>
                {b.enabled && (
                  <span className="text-sm font-sans text-foreground">
                    ${b.min} — ${b.max}
                  </span>
                )}
              </button>

              {b.enabled && (
                <div className="px-5 pb-5 pt-1 space-y-5 border-t border-border">
                  <div>
                    <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-2 block">
                      Minimum
                    </label>
                    <Slider
                      value={[b.min]}
                      onValueChange={([v]) =>
                        update(cat, { min: v, max: Math.max(b.max, v + 10) })
                      }
                      min={10}
                      max={500}
                      step={10}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-2 block">
                      Maximum
                    </label>
                    <Slider
                      value={[b.max]}
                      onValueChange={([v]) => update(cat, { max: Math.max(v, b.min + 10) })}
                      min={20}
                      max={2000}
                      step={10}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => update(cat, { min: p.min, max: p.max })}
                        className="text-xs font-sans px-3 py-1.5 rounded-full border border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetStep;
