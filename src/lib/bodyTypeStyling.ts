// ─────────────────────────────────────────────
// Body Type Styling Recommendation Engine
// Source: Free People "How to Dress for Your Body Type"
// https://www.freepeople.com/help/dress-for-your-body-type-blog/
// Drop this into your Lovable project under src/lib/
// ─────────────────────────────────────────────

// ── Types ────────────────────────────────────

export type BodyType =
  | "hourglass"
  | "pear"
  | "apple"
  | "rectangle"
  | "inverted-triangle";

export type HeightRange = "short" | "tall";
export type Gender = "women" | "men" | "all";

export type ClothingCategory =
  | "tops"
  | "bottoms"
  | "dresses"
  | "outerwear";

export type FitLevel = "most-flattering" | "flattering" | "avoid";

export interface SilhouetteTip {
  silhouette: string;
  why: string;
  fit: FitLevel;
}

export interface CategoryRecommendations {
  category: ClothingCategory;
  tips: SilhouetteTip[];
}

export interface BodyTypeProfile {
  type: BodyType;
  label: string;
  description: string;
  proportionCues: string[];
  goalSummary: string;
  /** General styling principles from Free People (color, pattern, fabric tips) */
  stylingPrinciples: string[];
  recommendations: CategoryRecommendations[];
}

// ── Body Type Profiles & Rules ───────────────

const profiles: Record<BodyType, BodyTypeProfile> = {
  hourglass: {
    type: "hourglass",
    label: "Hourglass",
    description: "Balanced bust and hips with a well-defined, narrower waist.",
    proportionCues: [
      "Bust and hips are roughly the same width",
      "Waist is noticeably narrower than both",
      "Weight distributes evenly top and bottom",
    ],
    goalSummary:
      "Highlight the defined waist; keep proportions balanced rather than adding volume to either end.",
    stylingPrinciples: [
      "Choose fabrics that drape and follow curves rather than stiff, boxy materials",
      "Always define the waist — belts, ties, and cinched details are your best friend",
      "Keep proportions balanced: if volume is added on top, echo it below",
    ],
    recommendations: [
      { category: "tops", tips: [
        { silhouette: "Wrap top", why: "Cinches at the natural waist and follows curves without adding bulk", fit: "most-flattering" },
        { silhouette: "Fitted V-neck", why: "Elongates the torso and frames the neckline without widening shoulders", fit: "most-flattering" },
        { silhouette: "Fitted bodysuit", why: "Follows the body's natural lines and stays tucked to maintain waist definition", fit: "most-flattering" },
        { silhouette: "Peplum top", why: "Accentuates the waist with a flared hem that echoes the hip line", fit: "flattering" },
        { silhouette: "Belted blouse", why: "Any top belted at the natural waist defines the silhouette", fit: "flattering" },
        { silhouette: "Oversized boxy crop", why: "Hides the waist and makes the torso look wider than it is", fit: "avoid" },
      ]},
      { category: "bottoms", tips: [
        { silhouette: "High-waisted skinny jeans", why: "Sits at the narrowest point and follows the leg line", fit: "most-flattering" },
        { silhouette: "Pencil skirt", why: "Mirrors the natural curve from waist to knee", fit: "most-flattering" },
        { silhouette: "A-line skirt", why: "Skims the hips gently while keeping the waist defined", fit: "flattering" },
        { silhouette: "Wide-leg trousers (high-rise)", why: "Balances curves with a clean drape from the waist", fit: "flattering" },
        { silhouette: "Low-rise baggy jeans", why: "Drops below the waist, erasing the defined midsection", fit: "avoid" },
      ]},
      { category: "dresses", tips: [
        { silhouette: "Wrap dress", why: "The gold standard — ties at the waist and follows every curve", fit: "most-flattering" },
        { silhouette: "Fit-and-flare", why: "Fitted bodice with a flared skirt spotlights the waist", fit: "most-flattering" },
        { silhouette: "Bodycon / fitted sheath", why: "Showcases the natural silhouette head to toe", fit: "flattering" },
        { silhouette: "Shift dress", why: "Straight cut bypasses the waist entirely, losing definition", fit: "avoid" },
      ]},
      { category: "outerwear", tips: [
        { silhouette: "Belted trench coat", why: "Cinches at the waist to maintain the hourglass shape under layers", fit: "most-flattering" },
        { silhouette: "Fitted blazer", why: "Structured shoulders with a nipped waist echo natural proportions", fit: "most-flattering" },
        { silhouette: "Cropped jacket", why: "Ends at the waist, keeping the eye on the narrowest point", fit: "flattering" },
        { silhouette: "Oversized puffer", why: "Adds bulk evenly, hiding the waist definition", fit: "avoid" },
      ]},
    ],
  },
  pear: {
    type: "pear",
    label: "Pear (Triangle)",
    description: "Hips and thighs are wider than the shoulders and bust; weight tends to settle in the lower body.",
    proportionCues: [
      "Hips are visibly wider than shoulders",
      "Defined waist, with fullness below it",
      "Narrower upper body and bust",
    ],
    goalSummary: "Draw attention upward with interesting necklines and structured shoulders; keep the lower half streamlined.",
    stylingPrinciples: [
      "Add volume, color, and detail on top to balance wider hips",
      "Keep bottoms in darker, solid colors to streamline the lower half",
      "Tops with horizontal details (wide necklines, puff sleeves) create upper-body width",
    ],
    recommendations: [
      { category: "tops", tips: [
        { silhouette: "Boat-neck or off-shoulder top", why: "Widens the shoulder line to balance wider hips", fit: "most-flattering" },
        { silhouette: "Structured puff-sleeve blouse", why: "Adds volume at the shoulders for visual balance", fit: "most-flattering" },
        { silhouette: "Embellished or printed top", why: "Bold details up top draw the eye away from the lower half", fit: "flattering" },
        { silhouette: "Fitted scoop-neck tee", why: "Clean and simple; doesn't compete but keeps the upper body defined", fit: "flattering" },
        { silhouette: "Clingy hip-length tunic", why: "Ends at the widest point and clings, emphasizing the hips", fit: "avoid" },
      ]},
      { category: "bottoms", tips: [
        { silhouette: "Dark straight-leg jeans", why: "Streamlines the leg with a continuous dark line", fit: "most-flattering" },
        { silhouette: "A-line maxi skirt", why: "Skims over the hips and flows to the floor without clinging to thighs", fit: "most-flattering" },
        { silhouette: "Wide-leg jeans", why: "Balanced denim option that drapes past the hips instead of gripping them", fit: "most-flattering" },
        { silhouette: "Bootcut or slight flare", why: "Balances the hip width with a wider hem", fit: "flattering" },
        { silhouette: "Wide-leg palazzo pants", why: "Drapes past the hips for an elongated, balanced look", fit: "flattering" },
        { silhouette: "Skinny jeans with no top coverage", why: "Highlights the contrast between narrow calves and wide hips", fit: "avoid" },
      ]},
      { category: "dresses", tips: [
        { silhouette: "Fit-and-flare dress", why: "Fitted bodice with a skirt that glides over the hips", fit: "most-flattering" },
        { silhouette: "Empire-waist dress", why: "Cinches just below the bust and flows over hips freely", fit: "most-flattering" },
        { silhouette: "Wrap dress", why: "Defines the waist while the skirt drapes past the lower body", fit: "flattering" },
        { silhouette: "Bodycon mini", why: "Clings tightly to the widest area and ends mid-thigh", fit: "avoid" },
      ]},
      { category: "outerwear", tips: [
        { silhouette: "Structured blazer with padded shoulders", why: "Broadens the shoulder line to match hip width", fit: "most-flattering" },
        { silhouette: "Cropped moto jacket", why: "Ends above the hip, keeping focus on the upper body", fit: "most-flattering" },
        { silhouette: "A-line coat", why: "Flares gently past the hips for smooth coverage", fit: "flattering" },
        { silhouette: "Hip-length parka", why: "Ends right at the widest point, drawing a horizontal line there", fit: "avoid" },
      ]},
    ],
  },
  apple: {
    type: "apple",
    label: "Apple (Round)",
    description: "Weight gathers around the midsection; bust is often full, with slimmer legs and arms.",
    proportionCues: [
      "Midsection is the widest area",
      "Less waist definition",
      "Slim legs and often slim arms",
    ],
    goalSummary: "Elongate the torso, create a waistline illusion, and show off great legs and arms.",
    stylingPrinciples: [
      "Monochromatic outfits create a long, unbroken vertical line that elongates the torso",
      "Vertical stripes and vertical seaming slim the midsection visually",
      "Show off slim legs and arms — they're your best assets",
      "Structured fabrics skim better than clingy knits around the midsection",
    ],
    recommendations: [
      { category: "tops", tips: [
        { silhouette: "V-neck tunic", why: "The V elongates the torso while the tunic skims over the midsection", fit: "most-flattering" },
        { silhouette: "Empire-waist top", why: "Gathers under the bust — the narrowest point — and flows over the belly", fit: "most-flattering" },
        { silhouette: "Wrap top with draping", why: "Creates diagonal lines across the midsection, slimming visually", fit: "flattering" },
        { silhouette: "Relaxed button-down (untucked)", why: "Structured fabric skims without clinging to the middle", fit: "flattering" },
        { silhouette: "Tight cropped top", why: "Cuts across the widest part and draws attention to the midsection", fit: "avoid" },
      ]},
      { category: "bottoms", tips: [
        { silhouette: "Straight-leg or bootcut jeans", why: "Creates a long vertical line from a comfortable mid-rise", fit: "most-flattering" },
        { silhouette: "A-line skirt", why: "Flares away from the midsection, creating space and a clean line from waist to hem", fit: "most-flattering" },
        { silhouette: "Slim-fit trousers", why: "Shows off slender legs while the top does the work up top", fit: "most-flattering" },
        { silhouette: "Knee-length pencil skirt", why: "Highlights slim legs and keeps the silhouette clean below", fit: "flattering" },
        { silhouette: "Skinny jeans (with a longer top)", why: "Great for showcasing legs when paired with a tunic or longer blouse", fit: "flattering" },
        { silhouette: "High-waisted paper-bag pants", why: "Gathers fabric at the midsection, adding bulk to the widest area", fit: "avoid" },
      ]},
      { category: "dresses", tips: [
        { silhouette: "Empire-waist maxi", why: "Defines the bust line and flows freely over the stomach and hips", fit: "most-flattering" },
        { silhouette: "Wrap dress", why: "Creates a faux waist with diagonal draping across the body", fit: "most-flattering" },
        { silhouette: "Shift dress with a belt just below the bust", why: "Adds structure at the narrowest upper point", fit: "flattering" },
        { silhouette: "Cinched-waist bodycon", why: "Compresses the midsection uncomfortably and highlights it", fit: "avoid" },
      ]},
      { category: "outerwear", tips: [
        { silhouette: "Longline open-front cardigan", why: "Creates long vertical lines that elongate the torso", fit: "most-flattering" },
        { silhouette: "Single-breasted blazer", why: "One column of buttons draws a vertical eye line down the center", fit: "most-flattering" },
        { silhouette: "Swing coat", why: "Flares from the shoulders, gliding over the midsection", fit: "flattering" },
        { silhouette: "Double-breasted pea coat", why: "Two columns of buttons and extra fabric widen the torso visually", fit: "avoid" },
      ]},
    ],
  },
  rectangle: {
    type: "rectangle",
    label: "Rectangle (Straight / Athletic)",
    description: "Shoulders, waist, and hips are roughly the same width with minimal waist definition.",
    proportionCues: [
      "Shoulder, waist, and hip measurements are similar",
      "Little natural curve at the waist",
      "Athletic or straight up-and-down frame",
    ],
    goalSummary: "Create the illusion of curves: define a waist and add dimension to either the upper or lower body (or both).",
    stylingPrinciples: [
      "Belts are essential — they create a waist where the body doesn't naturally define one",
      "Ruching, draping, and gathering add curves through fabric manipulation",
      "Layer pieces to build dimension (e.g., a cropped jacket over a fitted top)",
      "Peplum and flared hems at the hip create the illusion of an hourglass",
    ],
    recommendations: [
      { category: "tops", tips: [
        { silhouette: "Peplum top", why: "Flares at the hip line to mimic curves and narrows at the waist", fit: "most-flattering" },
        { silhouette: "Wrap or surplice top", why: "Diagonal neckline and cinched tie create the appearance of a waist", fit: "most-flattering" },
        { silhouette: "Cropped fitted top", why: "Ends above the hip, letting high-waisted bottoms create shape", fit: "flattering" },
        { silhouette: "Ruched or gathered blouse", why: "Textural detail adds dimension to a straight frame", fit: "flattering" },
        { silhouette: "Boxy oversized tee", why: "Follows the straight line of the body, adding no shape", fit: "avoid" },
      ]},
      { category: "bottoms", tips: [
        { silhouette: "High-waisted wide-leg pants", why: "Creates a waist anchor point and adds volume at the hem for curve illusion", fit: "most-flattering" },
        { silhouette: "Flared or A-line skirt", why: "Adds fullness at the hips where it's naturally lacking", fit: "most-flattering" },
        { silhouette: "Ruched skirt", why: "Gathered fabric creates texture and curves on a straight frame", fit: "most-flattering" },
        { silhouette: "Cargo pants or side-pocket details", why: "Pocket volume adds visual width at the hips", fit: "flattering" },
        { silhouette: "Belted paper-bag waist trousers", why: "The gathered waist and belt create shape", fit: "flattering" },
        { silhouette: "Straight-leg, flat-front trousers", why: "Mirror the straight silhouette without adding any curves", fit: "avoid" },
      ]},
      { category: "dresses", tips: [
        { silhouette: "Wrap dress", why: "The crossover bodice and tie waist create curves on a straight frame", fit: "most-flattering" },
        { silhouette: "Fit-and-flare dress", why: "Creates an hourglass shape with a fitted bodice and full skirt", fit: "most-flattering" },
        { silhouette: "Belted shirt dress", why: "The belt cinches the waist while the button-front adds visual interest", fit: "most-flattering" },
        { silhouette: "Tiered or ruffled skirt dress", why: "Layered fabric adds volume and curve to the lower body", fit: "flattering" },
        { silhouette: "Column / straight maxi", why: "Follows the straight frame without creating any shape", fit: "avoid" },
      ]},
      { category: "outerwear", tips: [
        { silhouette: "Belted trench coat", why: "The belt pulls in the waist for instant shape", fit: "most-flattering" },
        { silhouette: "Cropped jacket with peplum hem", why: "Ends at the waist with a flare that suggests hip curves", fit: "most-flattering" },
        { silhouette: "Asymmetrical-zip moto jacket", why: "Diagonal lines break up the straight torso visually", fit: "flattering" },
        { silhouette: "Long straight-cut overcoat", why: "Extends the straight line from shoulder to knee", fit: "avoid" },
      ]},
    ],
  },
  "inverted-triangle": {
    type: "inverted-triangle",
    label: "Inverted Triangle",
    description: "Broad shoulders and/or bust relative to narrower hips; often athletic builds.",
    proportionCues: [
      "Shoulders are visibly wider than hips",
      "Bust may be fuller, waist may or may not be defined",
      "Narrower hips and slimmer legs",
    ],
    goalSummary: "Soften the shoulder line and add volume to the lower body to balance the wider upper half.",
    stylingPrinciples: [
      "Keep tops simple — minimal detailing, darker colors to visually recede the upper body",
      "Add volume, prints, and lighter colors on the bottom half to draw the eye down",
      "Avoid anything that broadens the shoulders (epaulettes, puff sleeves, wide necklines)",
      "Soft, unstructured fabrics on top balance out a strong shoulder line",
    ],
    recommendations: [
      { category: "tops", tips: [
        { silhouette: "V-neck or scoop-neck fitted top", why: "Narrows the chest area and draws the eye inward and down", fit: "most-flattering" },
        { silhouette: "Raglan sleeve top", why: "Diagonal seams from the neckline soften the shoulder line", fit: "most-flattering" },
        { silhouette: "Simple, dark-colored blouse", why: "Minimizes the upper body with a receding color", fit: "flattering" },
        { silhouette: "Wrap top (without shoulder detail)", why: "Creates diagonal lines and a defined waist without broadening shoulders", fit: "flattering" },
        { silhouette: "Boat-neck or off-shoulder top", why: "Extends the already-wide shoulder line further", fit: "avoid" },
      ]},
      { category: "bottoms", tips: [
        { silhouette: "Wide-leg or palazzo pants", why: "Adds volume below the waist to match broader shoulders", fit: "most-flattering" },
        { silhouette: "Full A-line or circle skirt", why: "Maximum volume at the hem balances the upper body", fit: "most-flattering" },
        { silhouette: "Flared jeans", why: "The flared hem mirrors the shoulder width for symmetry", fit: "flattering" },
        { silhouette: "Light-colored or printed bottoms", why: "Bright colors and patterns draw the eye downward", fit: "flattering" },
        { silhouette: "Narrow skinny pants (alone)", why: "Emphasizes the taper from wide shoulders to narrow hips", fit: "avoid" },
      ]},
      { category: "dresses", tips: [
        { silhouette: "Full-skirted or flared dress", why: "Volume below the waist counterbalances the shoulders", fit: "most-flattering" },
        { silhouette: "V-neck A-line dress", why: "Narrows the neckline and flares the skirt in one piece", fit: "most-flattering" },
        { silhouette: "Tiered dress", why: "Layered ruffles add progressive volume to the lower body, balancing broad shoulders", fit: "most-flattering" },
        { silhouette: "Dropped-waist dress", why: "Moves the focal point below the shoulders and bust", fit: "flattering" },
        { silhouette: "Halter-neck bodycon", why: "Accentuates shoulder width and clings to narrow hips", fit: "avoid" },
      ]},
      { category: "outerwear", tips: [
        { silhouette: "Waterfall or draped cardigan", why: "Soft draping minimizes structured shoulder lines", fit: "most-flattering" },
        { silhouette: "Long-line coat with flared hem", why: "Adds volume at the bottom to mirror the upper body", fit: "most-flattering" },
        { silhouette: "Unstructured soft blazer", why: "Relaxed shoulders instead of padded, reducing width", fit: "flattering" },
        { silhouette: "Structured double-breasted blazer", why: "Padded shoulders and wide lapels broaden the top further", fit: "avoid" },
      ]},
    ],
  },
};

// ── Height-Based Styling Profiles ─────────────

export interface HeightTip {
  tip: string;
  why: string;
  fit: FitLevel;
}

export interface HeightProfile {
  height: HeightRange;
  gender: Gender;
  label: string;
  coreRule: string;
  tips: HeightTip[];
}

const heightProfiles: HeightProfile[] = [
  {
    height: "short",
    gender: "all",
    label: "Petite Styling — All Genders",
    coreRule: "Don't break the vertical line — keep the eye moving up and down in one continuous flow.",
    tips: [
      { tip: "High-waisted bottoms", why: "Raises the visual waistline so legs look longer", fit: "most-flattering" },
      { tip: "Monochrome outfits", why: "One continuous color creates an unbroken vertical line that elongates", fit: "most-flattering" },
      { tip: "Cropped or waist-length tops and jackets", why: "Raises the visual waist and keeps proportions compact", fit: "most-flattering" },
      { tip: "Vertical elements (seams, pleats, stripes)", why: "Draw the eye up and down, adding the illusion of length", fit: "most-flattering" },
      { tip: "Slim or straight silhouettes", why: "Follow the body closely without adding width that shortens", fit: "most-flattering" },
      { tip: "Shorter hemlines (above knee) or full-length", why: "Clean lines — avoid the awkward mid-calf chop", fit: "flattering" },
      { tip: "Low-rise pants", why: "Shorten the leg line by dropping the visual waist", fit: "avoid" },
      { tip: "Long, oversized tops or jackets", why: "Compress height by making the torso look long and legs short", fit: "avoid" },
      { tip: "Heavy layering that breaks the body into sections", why: "Each layer creates a horizontal break that chops height", fit: "avoid" },
      { tip: "Capri or mid-calf cuts", why: "Visually shorten the leg by cutting at an unflattering midpoint", fit: "avoid" },
      { tip: "Bulky shoes", why: "Can weigh down the frame and make you look bottom-heavy", fit: "avoid" },
    ],
  },
  {
    height: "tall",
    gender: "all",
    label: "Tall Styling — All Genders",
    coreRule: "Intentionally break the vertical line — use layers, horizontal details, and relaxed fits to add proportion.",
    tips: [
      { tip: "Layering (jackets, overshirts, vests)", why: "Breaks up vertical length into interesting segments", fit: "most-flattering" },
      { tip: "Mid-rise or low-rise pants", why: "Can work better than high-rise, which exaggerates leg length", fit: "most-flattering" },
      { tip: "Horizontal details (color blocking, belts, cuffs)", why: "Create visual breaks that add proportion to length", fit: "most-flattering" },
      { tip: "Relaxed or oversized fits", why: "You have the frame to carry volume without being overwhelmed", fit: "most-flattering" },
      { tip: "Wide-leg or looser silhouettes", why: "Add dimension and balance to a long frame", fit: "most-flattering" },
      { tip: "Head-to-toe vertical lines", why: "Can exaggerate height beyond what feels balanced", fit: "avoid" },
      { tip: "Ultra-skinny, super-long silhouettes", why: "Can look stretched and overly narrow on a tall frame", fit: "avoid" },
      { tip: "Very short hems (if you want to de-emphasize height)", why: "Can make long legs look even more prominent", fit: "avoid" },
    ],
  },
  {
    height: "short",
    gender: "men",
    label: "Petite Styling — Men",
    coreRule: "Tailored, proportional fit is everything — not tight, not baggy, just clean.",
    tips: [
      { tip: "Tailored, close fit (not tight, not baggy)", why: "Clean proportions make the most of your frame without drowning in fabric", fit: "most-flattering" },
      { tip: "Shorter jacket length (hits around mid-seat)", why: "Keeps the torso-to-leg ratio balanced instead of swallowing the legs", fit: "most-flattering" },
      { tip: "Higher-rise trousers", why: "Lengthens the leg line from waist to shoe", fit: "most-flattering" },
      { tip: "Minimal break in pants (clean line at the shoe)", why: "No fabric pooling at the ankle — keeps the leg looking long", fit: "most-flattering" },
      { tip: "Small-scale patterns", why: "Stay proportional to your frame; large patterns can overwhelm", fit: "flattering" },
      { tip: "Baggy clothing", why: "Makes you look smaller by hiding your actual frame in excess fabric", fit: "avoid" },
      { tip: "Long shirts or jackets", why: "Shortens the leg visually by extending the torso", fit: "avoid" },
      { tip: "Large prints or chunky details", why: "Oversized details can overwhelm a compact frame", fit: "avoid" },
      { tip: "Strong contrast between top and bottom", why: "A sharp color break at the waist cuts your height in half visually", fit: "avoid" },
    ],
  },
  {
    height: "tall",
    gender: "men",
    label: "Tall Styling — Men",
    coreRule: "Use layers and texture to add visual weight and break up length.",
    tips: [
      { tip: "Layering (jackets, overshirts)", why: "Adds visual weight and creates horizontal segments", fit: "most-flattering" },
      { tip: "Textured fabrics (tweed, corduroy, chunky knits)", why: "Add visual weight and substance to a long frame", fit: "most-flattering" },
      { tip: "Cuffed pants or slight break", why: "Creates a deliberate horizontal line at the ankle for proportion", fit: "flattering" },
      { tip: "Horizontal stripes or details", why: "Break up the vertical line and add width", fit: "flattering" },
      { tip: "Overly slim, elongated fits", why: "Can make you look stretched and lanky", fit: "avoid" },
      { tip: "Too-short sleeves or pants", why: "Fit matters more for tall builds — short pieces draw attention to excess length", fit: "avoid" },
    ],
  },
  {
    height: "short",
    gender: "women",
    label: "Petite Styling — Women",
    coreRule: "Elongate with clean lines, high waists, and pointed shoes — keep outfits simple and streamlined.",
    tips: [
      { tip: "High-waisted skirts and pants", why: "Raises the waist to create a longer leg line", fit: "most-flattering" },
      { tip: "Mini or above-knee lengths", why: "Shows more leg, elongating the lower body", fit: "most-flattering" },
      { tip: "Fitted silhouettes", why: "Follow your frame cleanly without adding width or bulk", fit: "most-flattering" },
      { tip: "Pointed-toe shoes", why: "Extends the leg line past the toe for extra visual length", fit: "most-flattering" },
      { tip: "Simple, clean outfits (low visual clutter)", why: "Fewer visual breaks keep the eye moving in one line", fit: "most-flattering" },
      { tip: "Midi skirts (mid-calf)", why: "Cut the leg at an unflattering midpoint, shortening visually", fit: "avoid" },
      { tip: "Oversized everything", why: "Drowns a petite frame and hides your proportions", fit: "avoid" },
      { tip: "Ankle straps", why: "Create a horizontal line across the ankle that cuts the leg short", fit: "avoid" },
    ],
  },
  {
    height: "tall",
    gender: "women",
    label: "Tall Styling — Women",
    coreRule: "You have the most flexibility — tall frames carry volume, length, and statement pieces beautifully.",
    tips: [
      { tip: "Maxi dresses", why: "You own these — tall frames give maxis the length they need to flow properly", fit: "most-flattering" },
      { tip: "Layered looks", why: "Multiple pieces create visual interest and break up height proportionally", fit: "most-flattering" },
      { tip: "Wide-leg pants", why: "Add volume that balances a long frame beautifully", fit: "most-flattering" },
      { tip: "Statement pieces (bold jewelry, structured bags, dramatic coats)", why: "You have the visual 'space' to carry pieces that might overwhelm a smaller frame", fit: "most-flattering" },
    ],
  },
];

// ── Public API ────────────────────────────────

export function getProfile(bodyType: BodyType): BodyTypeProfile {
  return profiles[bodyType];
}

export function getAllBodyTypes(): { type: BodyType; label: string; description: string }[] {
  return Object.values(profiles).map(({ type, label, description }) => ({ type, label, description }));
}

export function getRecommendations(bodyType: BodyType, category?: ClothingCategory): CategoryRecommendations[] {
  const profile = profiles[bodyType];
  if (category) return profile.recommendations.filter((r) => r.category === category);
  return profile.recommendations;
}

export function getTopPicks(bodyType: BodyType, category?: ClothingCategory): CategoryRecommendations[] {
  return getRecommendations(bodyType, category).map((c) => ({ ...c, tips: c.tips.filter((t) => t.fit === "most-flattering") }));
}

export function getAvoidList(bodyType: BodyType, category?: ClothingCategory): CategoryRecommendations[] {
  return getRecommendations(bodyType, category).map((c) => ({ ...c, tips: c.tips.filter((t) => t.fit === "avoid") }));
}

export function getStylingPrinciples(bodyType: BodyType): string[] {
  return profiles[bodyType].stylingPrinciples;
}

// ── Height API ──────────────────────────────

export function getHeightRecommendations(height: HeightRange, gender?: Gender): HeightProfile[] {
  const results: HeightProfile[] = [];
  const universal = heightProfiles.find((p) => p.height === height && p.gender === "all");
  if (universal) results.push(universal);
  if (gender && gender !== "all") {
    const specific = heightProfiles.find((p) => p.height === height && p.gender === gender);
    if (specific) results.push(specific);
  }
  return results;
}

export function getHeightWearThis(height: HeightRange, gender?: Gender): HeightProfile[] {
  return getHeightRecommendations(height, gender).map((p) => ({ ...p, tips: p.tips.filter((t) => t.fit !== "avoid") }));
}

export function getHeightAvoidThis(height: HeightRange, gender?: Gender): HeightProfile[] {
  return getHeightRecommendations(height, gender).map((p) => ({ ...p, tips: p.tips.filter((t) => t.fit === "avoid") }));
}

export function getFullStyleProfile(input: { bodyType: BodyType; height: HeightRange; gender?: Gender }): {
  bodyTypeProfile: BodyTypeProfile;
  heightProfiles: HeightProfile[];
  coreHeightRule: string;
} {
  const bodyTypeProfile = profiles[input.bodyType];
  const hProfiles = getHeightRecommendations(input.height, input.gender);
  const coreHeightRule = hProfiles.find((p) => p.gender === "all")?.coreRule ?? hProfiles[0]?.coreRule ?? "";
  return { bodyTypeProfile, heightProfiles: hProfiles, coreHeightRule };
}

export function isSilhouetteRecommended(bodyType: BodyType, silhouetteName: string): { found: boolean; fit?: FitLevel; why?: string; category?: ClothingCategory } {
  const profile = profiles[bodyType];
  for (const catRec of profile.recommendations) {
    const match = catRec.tips.find((t) => t.silhouette.toLowerCase() === silhouetteName.toLowerCase());
    if (match) return { found: true, fit: match.fit, why: match.why, category: catRec.category };
  }
  return { found: false };
}

export function detectBodyType(input: {
  shoulderWidth: "narrow" | "medium" | "broad";
  waistDefinition: "very-defined" | "somewhat-defined" | "straight";
  hipWidth: "narrow" | "medium" | "wide";
}): BodyType {
  const { shoulderWidth, waistDefinition, hipWidth } = input;
  if (waistDefinition === "very-defined" && ((shoulderWidth === "medium" && hipWidth === "medium") || (shoulderWidth === "broad" && hipWidth === "wide"))) return "hourglass";
  if (hipWidth === "wide" && (shoulderWidth === "narrow" || shoulderWidth === "medium")) return "pear";
  if (shoulderWidth === "broad" && (hipWidth === "narrow" || hipWidth === "medium") && waistDefinition !== "very-defined") return "inverted-triangle";
  if (waistDefinition === "straight" && shoulderWidth !== "broad") {
    if (hipWidth === "narrow") return "apple";
  }
  if (waistDefinition === "straight" || waistDefinition === "somewhat-defined") return "rectangle";
  return "rectangle";
}
