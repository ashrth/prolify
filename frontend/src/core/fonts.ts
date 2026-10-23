import { loadFont as loadSpartan } from "@remotion/google-fonts/LeagueSpartan";

// Remotion waits for fonts before rendering any frame, so there's never a flash of a fallback font.
// To add a font: import its loader from @remotion/google-fonts/<FontNameWithoutSpaces>
// and add it to this list. Scenes pick one with `font: "name"`.
export const fonts = {
  spartan: loadSpartan("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] }).fontFamily,
};

export type FontName = keyof typeof fonts;

// default font for every scene
export const fontFamily = fonts.spartan;
