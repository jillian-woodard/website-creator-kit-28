import { useStyle } from "@/lib/styleContext";
import { Check } from "lucide-react";

export type RecalibrationCadence = "weekly" | "monthly" | "quarterly" | "never";

const options: { id: RecalibrationCadence; label: string; desc: string }[] = [
  { id: "weekly", label: "Weekly", desc: "Tiny check-ins. Best when your taste is shifting fast." },
  { id: "monthly", label: "Monthly", desc: "A balanced rhythm that keeps your profile fresh without the noise." },
  { id: "quarterly", label: "Quarterly", desc: "Seasonal recalibration. Light-touch and aligned with new collections." },
  { id: "never", label: "Not now", desc: "Skip recurring check-ins. You can recalibrate manually anytime." },
];

const RecalibrationStep = () => {
  const { data, updateData } = useStyle();
  const selected = data.recalibrationCadence;

  return (
    <div>
      <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-3 font-sans">
        Final step
      </p>
      <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-3">
        How often should we recalibrate?
      </h2>
      <p className="text-muted-foreground font-sans font-light mb-8 max-w-lg">
        Style evolves. We'll send you a quick visual A/B test on this cadence to keep your profile
        sharp and your recommendations on point.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const active = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => updateData({ recalibrationCadence: opt.id })}
              className={`group relative text-left rounded-lg border p-6 transition-all ${
                active
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              {active && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
              <h3 className="font-serif text-xl text-foreground mb-1.5">{opt.label}</h3>
              <p className="text-sm text-muted-foreground font-sans font-light leading-relaxed pr-8">
                {opt.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RecalibrationStep;
