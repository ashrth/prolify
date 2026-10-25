import type { VideoScript } from "../../../core/types";
import { x657oBrand } from "../brand";

// A personal edit, not an ad: no text, no logo, no UI sounds. Just the photos and music.
const A = "x657o/ascii";

// Timing. To sync with your track: EVERY = frames per beat × 2 (frames per beat = 1800 / BPM).
// e.g. 100 BPM → 18 frames per beat → EVERY = 36.
const FIRST = 40; // how long the untouched photo shows first
const EVERY = 36; // time between each new photo (~1.2s)
const at = (n: number) => FIRST + n * EVERY;

export const x657oAsciiEdit: VideoScript = {
  brand: x657oBrand,
  // music: { src: "sounds/edit-music.mp3", volume: 0.7 },
  scenes: [
    {
      type: "photo-stack",
      duration: at(5) + 52,
      transition: 14,
      objectPosition: "80% 50%",
      grain: true,
      fadeOut: 18,
      steps: [
        { at: 0, image: `${A}/original.jpg` }, // the photo as taken
        { at: at(0), image: `${A}/dense.jpg`, region: "left" }, // covers the left half
        { at: at(1), image: `${A}/blocks.jpg`, region: "right" }, // covers the right half
        { at: at(2), image: `${A}/classic-blue.jpg` }, // replaces everything
        { at: at(3), image: `${A}/binary.jpg` },
        { at: at(4), image: `${A}/image-behind.jpg` },
      ],
    },
  ],
};
