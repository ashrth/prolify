import { loadFont as loadSpartan } from "@remotion/google-fonts/LeagueSpartan";
import { loadFont as loadInstrument } from "@remotion/google-fonts/InstrumentSerif";

export const fonts = {
  spartan: loadSpartan("normal", {
    weights: ["400", "500", "700"],
    subsets: ["latin"],
  }).fontFamily,
  instrument: loadInstrument("normal", { weights: ["400"], subsets: ["latin"] })
    .fontFamily,
};

export type FontName = keyof typeof fonts;

// default font for every scene
export const fontFamily = fonts.spartan;
