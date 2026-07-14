import { useStyle } from "@/lib/styleContext";
import { Check } from "lucide-react";
import { Instagram, ExternalLink } from "lucide-react";
import { styleIcons, categories } from "@/lib/styleIconsData";

const VisualCuesStep = () => {
  const { data, updateData } = useStyle();

  const toggleImage = (id: string) => {
    const current = data.selectedVisualCues;
    if (current.includes(id)) {
      updateData({ selectedVisualCues: current.filter((c) => c !== id) });
    } else {
      updateData({ selectedVisualCues: [...current, id] });
    }
  };

  const isSelected = (id: string) => data.selectedVisualCues.includes(id);

  return (
    <div>
      <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-3 font-sans">
        Step 2
      </p>
      <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-3">
        What catches your eye?
      </h2>
      <p className="text-muted-foreground font-sans font-light mb-4 max-w-lg">
        Tap any style icons that speak to you. Select as many as you want. It helps us understand your aesthetic.
      </p>
      <p className="text-xs text-muted-foreground/70 font-sans mb-8">
        {data.selectedVisualCues.length} selected
      </p>

      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h3 className="text-sm font-sans uppercase tracking-[0.15em] text-muted-foreground mb-4">
            {category}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {styleIcons
              .filter((icon) => icon.category === category)
              .map((icon) => (
                <button
                  key={icon.id}
                  onClick={() => toggleImage(icon.id)}
                  className={`group relative aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all ${
                    isSelected(icon.id)
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent hover:border-primary/30"
                  }`}
                >
                  <img
                    src={icon.img}
                    alt={icon.name}
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Overlay */}
                  <div className={`absolute inset-0 transition-opacity ${
                    isSelected(icon.id) ? "bg-primary/20" : "bg-foreground/0 group-hover:bg-foreground/10"
                  }`} />
                  {/* Check badge */}
                  {isSelected(icon.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  )}
                  {/* Social links on hover */}
                  {(icon.instagram || icon.ltk) && (
                    <div className="absolute top-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {icon.instagram && (
                        <a
                          href={icon.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-7 h-7 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                        >
                          <Instagram className="w-3.5 h-3.5 text-foreground" />
                        </a>
                      )}
                      {icon.ltk && (
                        <a
                          href={icon.ltk}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-7 h-7 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                          title="Shop on LTK"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-foreground" />
                        </a>
                      )}
                    </div>
                  )}
                  {/* Label */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/60 to-transparent p-3 pt-8">
                    <p className="text-xs font-sans text-background font-medium">{icon.name}</p>
                    <p className="text-[10px] font-sans text-background/70">{icon.from}</p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      ))}

      <p className="text-sm text-muted-foreground/70 font-sans italic mt-4">
        No pressure. You can skip this step if nothing stands out. Your vibe description already tells us a lot!
      </p>
    </div>
  );
};

export default VisualCuesStep;
