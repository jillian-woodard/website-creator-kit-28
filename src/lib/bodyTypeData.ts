export interface BodyTypeInfo {
  id: string;
  name: string;
  desc: string;
  wear: string;
  skip: string;
}

export interface ShortMenTip {
  name: string;
  desc: string;
  wear: string;
  skip: string;
  highlight?: boolean;
}

export const womenBodyTypes: BodyTypeInfo[] = [
  {
    id: "hourglass",
    name: "Hourglass",
    desc: "Shoulders and hips roughly equal, with a defined waist. The classic balanced proportion.",
    wear: "Wrap dresses, fitted silhouettes, belted styles, bodycon, high-waisted anything",
    skip: "Boxy or shapeless cuts that hide your waist definition",
  },
  {
    id: "pear",
    name: "Pear / Triangle",
    desc: "Hips wider than shoulders. Weight carried in the lower body.",
    wear: "Bold necklines, detailed tops, A-line skirts, wide-leg trousers, dark bottoms",
    skip: "Heavy volume or patterns at the hip, tapered trousers that emphasize thighs",
  },
  {
    id: "inverted-triangle",
    name: "Inverted Triangle",
    desc: "Shoulders broader than hips. Athletic upper body.",
    wear: "V-necks, halter tops, wide-leg or flared pants, A-line skirts, volume at the hip",
    skip: "Off-shoulder, boat necks, heavy shoulder details, tapered bottoms",
  },
  {
    id: "rectangle",
    name: "Rectangle",
    desc: "Shoulders, waist, and hips roughly the same width. Little waist definition.",
    wear: "Wrap styles, peplum tops, belted dresses, ruffles, layering to create waist definition",
    skip: "Boxy straight cuts that reinforce the linear silhouette",
  },
  {
    id: "apple",
    name: "Apple / Round",
    desc: "Fuller midsection, slimmer legs. Weight carried in the torso.",
    wear: "Empire waists, wrap dresses, A-line cuts, V-necks, flowy fabrics, vertical lines",
    skip: "Clingy midsection fabrics, wide horizontal stripes, tucked-in tops without structure",
  },
  {
    id: "petite",
    name: "Petite",
    desc: "Shorter stature. Proportions vary — main goal is elongation.",
    wear: "Monochrome head-to-toe, high-waisted bottoms, vertical stripes, cropped jackets",
    skip: "Oversized cuts that overwhelm, wide horizontal bands that cut the body in half",
  },
];

export const menBodyTypes: BodyTypeInfo[] = [
  {
    id: "trapezoid",
    name: "Trapezoid / Athletic",
    desc: "Broad shoulders tapering to a defined waist. The most versatile male shape to dress.",
    wear: "Slim or muscle-fit shirts, tailored jackets, slim trousers, bold colors — maximum freedom",
    skip: "Very baggy cuts that hide the frame",
  },
  {
    id: "inverted-triangle",
    name: "Inverted Triangle",
    desc: "Very broad shoulders, narrow waist and hips. Muscular upper body.",
    wear: "V-necks, slim-fit bottoms, straight-leg denim, structured blazers",
    skip: "Padded shoulders, horizontal stripes across the chest",
  },
  {
    id: "rectangle",
    name: "Rectangle",
    desc: "Shoulders, chest, and waist all similar width. Slim, linear build.",
    wear: "Layering to add bulk, horizontal stripes, structured blazers, fitted shirts, tapered trousers",
    skip: "Oversized baggy clothes, super skinny cuts",
  },
  {
    id: "triangle",
    name: "Triangle",
    desc: "Narrower shoulders, wider waist and hips. Bottom-heavy.",
    wear: "Structured jackets with shoulder detail, V-necks, lighter tops, dark straight-leg trousers",
    skip: "Pleated or wide-leg trousers, baggy tops that de-emphasize the shoulder",
  },
  {
    id: "oval",
    name: "Oval",
    desc: "Fuller midsection, rounder torso. Weight carried centrally.",
    wear: "Dark colors, vertical stripes, single-breasted tailored jackets, well-fitted shirts, long coats",
    skip: "Tight shirts at the midsection, baggy shapeless clothes, bold horizontal patterns",
  },
];

export const shortMenTips: ShortMenTip[] = [
  {
    name: "Fit is everything",
    desc: "Off-the-rack is built for ~5'10\". Anything slightly too long or boxy will swamp a shorter frame.",
    wear: "Budget for a tailor — shirt sleeves, trouser length, and jacket body are the three biggest fixes",
    skip: "Buying clothes hoping they'll \"work\" — excess fabric is the enemy of proportion",
    highlight: true,
  },
  {
    name: "Tops",
    desc: "Length and silhouette are the two levers.",
    wear: "Slim or fitted shirts, shorter jacket lengths (hip or above), vertical stripes, turtlenecks to elongate the neck",
    skip: "Longline tees, long cardigans, anything that cuts the body at the hip or lower",
  },
  {
    name: "Bottoms",
    desc: "Keep the leg line clean and unbroken.",
    wear: "Slim or tapered trousers, high-rise waist to lengthen the leg, ankle or no-break hem",
    skip: "Wide-leg or pleated pants, cuffed hems that cut the leg, shorts past mid-thigh",
  },
  {
    name: "Shoes",
    desc: "Footwear either extends or cuts the leg line.",
    wear: "Chelsea boots, loafers, low-profile sneakers — match shoe color to trousers to extend the leg",
    skip: "Ankle straps or high-contrast shoes that visually cut the leg at the foot",
  },
  {
    name: "Outerwear",
    desc: "Coat length dramatically affects perceived height.",
    wear: "Coats that hit above the knee, bombers, cropped peacoats — monochrome coat + outfit is the best elongating combo",
    skip: "Long overcoats unless the full outfit underneath is one color and slim",
  },
  {
    name: "The monochrome trick",
    desc: "The single biggest height-adding move in any short man's playbook.",
    wear: "One color or tonal family head to toe — creates one unbroken vertical line from shoulder to shoe",
    skip: "High-contrast color blocking — it visually cuts the body in half and reduces perceived height",
  },
];

export const universalRules = [
  "Fit beats formula every time. A well-fitting garment in the \"wrong\" category beats the \"right\" category in the wrong size.",
  "Know a tailor. Off-the-rack rarely fits perfectly — small alterations make a big difference.",
  "Vertical lines and monochrome elongate. Horizontal lines and color blocks shorten or widen.",
  "Dark colors recede, light colors advance. Use this to draw attention toward or away from any area.",
  "These rules assume the goal is a \"balanced\" silhouette — if that's not your goal, they don't apply.",
  "Confidence reads louder than any silhouette rule. Wear what makes you feel good.",
];

/**
 * Given a silhouette type from the user's style profile, return the matching
 * body-type dressing guidance to inject into AI prompts.
 */
export function getBodyTypeGuidance(silhouetteType: string | null | undefined): string {
  if (!silhouetteType) return "";

  const allTypes = [...womenBodyTypes, ...menBodyTypes];
  const match = allTypes.find(
    (t) => t.id === silhouetteType || t.name.toLowerCase().includes(silhouetteType.toLowerCase())
  );

  if (!match) return "";

  return `Body type: ${match.name} — ${match.desc}
WEAR: ${match.wear}
AVOID: ${match.skip}`;
}
