import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { loadFont as loadMarker } from "@remotion/google-fonts/PermanentMarker";
import { loadFont as loadShadows } from "@remotion/google-fonts/ShadowsIntoLight";
import type { CaptionFontName } from "./types";

// The caption fonts. `size` is the font size as a fraction of the card's width.
// To add one: import its loader from @remotion/google-fonts/<NameWithoutSpaces>, add it here,
// and add its key to CaptionFontName in types.ts.
export const captionFonts: Record<CaptionFontName, { label: string; family: string; size: number }> = {
  marker: { label: "permanent marker", family: loadMarker("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily, size: 0.072 },
  caveat: { label: "caveat", family: loadCaveat("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily, size: 0.098 },
  shadows: { label: "shadows into light", family: loadShadows("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily, size: 0.09 },
};
