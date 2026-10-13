import { loadFont } from "@remotion/google-fonts/LeagueSpartan";

// Remotion waits for the font before rendering any frame,
// so there's never a flash of a fallback font in the video.
export const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});
