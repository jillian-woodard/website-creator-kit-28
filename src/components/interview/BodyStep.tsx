import { useStyle } from "@/lib/styleContext";
import { Input } from "@/components/ui/input";
import { Camera, User, Ruler } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const silhouettes = [
  { id: "hourglass", label: "Hourglass", desc: "Balanced shoulders & hips, defined waist" },
  { id: "pear", label: "Pear", desc: "Hips wider than shoulders" },
  { id: "rectangle", label: "Rectangle", desc: "Even proportions throughout" },
  { id: "inverted-triangle", label: "Inverted Triangle", desc: "Shoulders wider than hips" },
  { id: "apple", label: "Apple", desc: "Fuller through the middle" },
];

// 4'8" (56in) through 6'8" (80in)
const HEIGHT_OPTIONS: { value: number; label: string }[] = [];
for (let inches = 56; inches <= 80; inches++) {
  const ft = Math.floor(inches / 12);
  const inch = inches % 12;
  HEIGHT_OPTIONS.push({ value: inches, label: `${ft}'${inch}"` });
}

const BodyStep = () => {
  const { data, updateData } = useStyle();

  const selectMethod = (method: "photo" | "silhouette" | "manual") => {
    updateData({ bodyInputMethod: method });
  };

  return (
    <div>
      <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-3 font-sans">
        Step 3
      </p>
      <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-3">
        Help us understand your shape.
      </h2>
      <p className="text-muted-foreground font-sans font-light mb-8 max-w-lg">
        This helps us recommend silhouettes that work for you. Choose whichever option feels comfortable. All three lead to the same great recommendations.
      </p>

      {/* Height (required) */}
      <div className="mb-8 p-6 rounded-lg border border-border bg-card">
        <label className="text-sm font-sans font-medium text-foreground mb-1 block">
          Your height <span className="text-primary">*</span>
        </label>
        <p className="text-xs text-muted-foreground font-sans mb-4">
          Helps us recommend silhouettes that flatter your frame.
        </p>
        <Select
          value={data.heightInches ? String(data.heightInches) : ""}
          onValueChange={(v) => updateData({ heightInches: parseInt(v, 10) })}
        >
          <SelectTrigger className="w-full sm:w-48 bg-background border-border font-sans">
            <SelectValue placeholder="Select height" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {HEIGHT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Method selection */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { method: "photo" as const, icon: Camera, title: "Photo Upload", desc: "AI estimates your proportions" },
          { method: "silhouette" as const, icon: User, title: "Visual Selector", desc: "Pick your closest match" },
          { method: "manual" as const, icon: Ruler, title: "Measurements", desc: "Enter bust, waist, hips" },
        ].map(({ method, icon: Icon, title, desc }) => (
          <button
            key={method}
            onClick={() => selectMethod(method)}
            className={`p-6 rounded-lg border text-left transition-all ${
              data.bodyInputMethod === method
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <Icon className={`w-6 h-6 mb-3 ${data.bodyInputMethod === method ? "text-primary" : "text-muted-foreground"}`} />
            <p className="font-sans font-medium text-foreground text-sm">{title}</p>
            <p className="text-xs text-muted-foreground font-sans mt-1">{desc}</p>
          </button>
        ))}
      </div>

      {/* Conditional content */}
      {data.bodyInputMethod === "photo" && (
        <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center">
          <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-sans text-sm mb-2">
            Upload a full-body photo
          </p>
          <p className="text-xs text-muted-foreground font-sans">
            We'll estimate your proportions. You can adjust the results.
          </p>
          <button
            onClick={() => updateData({ silhouetteType: "estimated" })}
            className="mt-4 text-sm font-sans px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary/5 transition-colors"
          >
            Simulate Upload
          </button>
        </div>
      )}

      {data.bodyInputMethod === "silhouette" && (
        <div className="space-y-3">
          {silhouettes.map((s) => (
            <button
              key={s.id}
              onClick={() => updateData({ silhouetteType: s.id })}
              className={`w-full p-5 rounded-lg border text-left transition-all flex items-center gap-4 ${
                data.silhouetteType === s.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <User className={`w-5 h-5 ${data.silhouetteType === s.id ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="font-sans font-medium text-foreground text-sm">{s.label}</p>
                <p className="text-xs text-muted-foreground font-sans">{s.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {data.bodyInputMethod === "manual" && (
        <div className="bg-card border border-border rounded-lg p-8 space-y-5">
          <p className="text-sm text-muted-foreground font-sans font-light">
            💡 Your measurements help us suggest what size to order from specific brands and stores. No more guessing.
          </p>
          {(["bust", "waist", "hips"] as const).map((field) => (
            <div key={field}>
              <label className="text-sm text-muted-foreground font-sans capitalize mb-2 block">
                {field} (inches)
              </label>
              <Input
                type="number"
                value={data.manualMeasurements[field]}
                onChange={(e) =>
                  updateData({
                    manualMeasurements: { ...data.manualMeasurements, [field]: e.target.value },
                  })
                }
                placeholder={`Enter ${field} measurement`}
                className="bg-background border-border font-sans"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BodyStep;
