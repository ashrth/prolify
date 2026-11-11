import { disciplineTemplate } from "./template";

// Leg day: same layout and music, new clips. Fill in your files and the seconds you like.
// Find good seconds with a contact sheet (see the guide), and make the hero cutout with tools/cutout.sh.
export const disciplineLegs = disciplineTemplate({
  theme: {
    blackAndWhite: false,
    colorBoost: false,
    bw: { exposure: 0, contrast: 1.2, brightness: 1 },
    boost: { amount: 1.8, exposure: 0, contrast: 1.1, brightness: 1 },
  },
  word: "DISCIPLINE",
  music: "gym/track.mp3", // same track; point to another file to change it
  hero: {
    src: "gym/legs/hero.mp4", // the clip behind the word (uses 3.4s from `at`)
    at: 0.0,
    // cutout: { folder: "gym/legs/hero-cutout", count: 102 }, // remove the // once the cutout exists
  },
  flex: { src: "gym/legs/flex.mp4", moments: [0.5, 1.5, 2.5, 3.5] },
  moves: [
    { src: "gym/legs/squats.mp4", moments: [1.0, 2.5, 4.0] },
    { src: "gym/legs/lunges.mp4", moments: [0.5, 1.8, 3.0, 4.2] },
    { src: "gym/legs/leg-press.mp4", moments: [1.0, 2.2, 3.4] },
    { src: "gym/legs/b-roll.mp4", moments: [0.2, 1.0, 1.6] },
    { src: "gym/legs/rdl.mp4", moments: [0.8, 2.0, 3.2, 4.4] },
  ],
});
