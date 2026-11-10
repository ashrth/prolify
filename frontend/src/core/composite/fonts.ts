import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";

export const compFonts = {
  serif: loadCormorant("normal", { weights: ["300", "400"], subsets: ["latin"] }).fontFamily, // the big thin letters
  hand: loadCaveat("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily, // the scribble
};
