import { useStyle } from "@/lib/styleContext";
import { Textarea } from "@/components/ui/textarea";
import StyleWordSelector from "@/components/StyleWordSelector";

const VibeStep = () => {
  const { data, updateData } = useStyle();

  return (
    <div>
      <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-3 font-sans">
        Step 1
      </p>
      <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-3">
        Describe your vibe.
      </h2>
      <p className="text-muted-foreground font-sans font-light mb-8 max-w-lg">
        Talk to us like you'd talk to a stylist. What do you want to feel like when you walk into a room?
      </p>

      <Textarea
        value={data.vibeDescription}
        onChange={(e) => updateData({ vibeDescription: e.target.value })}
        placeholder="Tell us your vision..."
        className="min-h-[120px] bg-card border-border text-foreground font-sans text-base resize-none focus:ring-primary/30 mb-8"
      />

      <div>
        <p className="text-xs text-muted-foreground font-sans mb-3 uppercase tracking-wider">
          Need inspiration? Pick what you want to look like:
        </p>

        <div className="-mx-8 mb-6">
          <StyleWordSelector />
        </div>

        <p className="text-sm text-muted-foreground/70 font-sans italic">
          Feel free to skip this if no words come to mind! You can select visual cues next.
        </p>
      </div>
    </div>
  );
};

export default VibeStep;
