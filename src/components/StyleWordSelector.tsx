import { useStyle } from "@/lib/styleContext";

interface StyleWord {
  word: string;
  description: string;
}

const STYLE_WORDS: StyleWord[] = [
  {
    word: "Effortless",
    description: "Looks unfussy but considered. Easy silhouettes, minimal styling, never trying too hard.",
  },
  {
    word: "Polished",
    description: "Clean, refined, put-together. Tailored lines, considered details, always intentional.",
  },
  {
    word: "Minimalist",
    description: "Pared back and intentional. Neutral palette, clean lines, quality over quantity.",
  },
  {
    word: "Classic",
    description: "Timeless staples that never date. Tailored, traditional, built to last across decades.",
  },
  {
    word: "Bohemian",
    description: "Flowy, layered, earthy. Free-spirited textures, vintage influence, soft and unstructured.",
  },
  {
    word: "Eclectic",
    description: "Mixes eras, genres, and unexpected pieces. Personality-forward and rule-breaking.",
  },
  {
    word: "Maximalist",
    description: "Bold patterns, rich color, lots of layering. More is more, and every piece has a voice.",
  },
  {
    word: "Preppy",
    description: "Collegiate and traditional. Tailored basics, refined details, heritage-inspired.",
  },
  {
    word: "Feminine",
    description: "Soft fabrics, florals, romantic details. Leans into traditionally feminine silhouettes.",
  },
  {
    word: "Edgy",
    description: "Leather, asymmetry, sharper silhouettes. Confident, a little rebellious, never safe.",
  },
];

export default function StyleWordSelector() {
  const { data, updateData } = useStyle();

  // Derive selection from the shared vibe description so Continue works.
  const selectedWords = new Set(
    data.vibeDescription
      .split(",")
      .map((w) => w.trim())
      .filter(Boolean)
  );

  const toggleWord = (word: string) => {
    const next = new Set(selectedWords);
    if (next.has(word)) {
      next.delete(word);
    } else {
      next.add(word);
    }
    updateData({ vibeDescription: Array.from(next).join(", ") });
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-8">
      <div className="flex flex-wrap gap-3">
        {STYLE_WORDS.map(({ word, description }) => {
          const isSelected = selectedWords.has(word);

          return (
            <div key={word} className="relative group">
              <button
                onClick={() => toggleWord(word)}
                className={`
                  px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200
                  border
                  ${
                    isSelected
                      ? "bg-stone-800 text-stone-50 border-stone-800"
                      : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
                  }
                `}
                aria-pressed={isSelected}
                aria-describedby={`tooltip-${word}`}
              >
                {word}
              </button>

              <div
                id={`tooltip-${word}`}
                role="tooltip"
                className="
                  hidden group-hover:block
                  absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2
                  w-64 px-4 py-3
                  bg-stone-900 text-stone-50 text-xs leading-relaxed
                  rounded-lg shadow-lg
                  pointer-events-none
                "
              >
                {description}
                <div
                  className="
                    absolute top-full left-1/2 -translate-x-1/2
                    border-4 border-transparent border-t-stone-900
                  "
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
