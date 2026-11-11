import { disciplineTemplate } from "./template";

// The original DISCIPLINE edit (back day). Paths are in /public.
// If you tweaked the original (filters, cutout count…), copy those values here.
export const disciplineBack = disciplineTemplate({
  word: "DISCIPLINE",
  music: "gym/track.mp3",
  hero: { src: "gym/flex.mp4", at: 11.0, scale: 1.3, shiftX: 10, cutout: { folder: "gym/flex-cutout", count: 102 } },
  flex: { src: "gym/flex.mp4", moments: [1.4, 6.4, 11.8, 12.6] },
  moves: [
    { src: "gym/lat_pull_down.mp4", zoom: 1.1, moments: [1.0, 3.6, 4.5] },
    { src: "gym/row.mp4", moments: [0.6, 2.0, 1.5, 2.6, 4.3, 3.0] },
    { src: "gym/seated_rowing.mp4", zoom: 1.1, moments: [0.7, 2.2, 4.4] },
    { src: "gym/C0015.mov", moments: [0.0, 1.3, 1.6] },
    { src: "gym/C0022.MP4", zoom: 1.1, moments: [2.3, 0.2, 4.0, 0.6] },
  ],
});
