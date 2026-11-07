import type { FootageClip, Shot, VideoScript } from "../../core/types";

// Your clips, in public/gym/. `zoom` hides the black bars baked into some of them.
const clips: Record<string, FootageClip> = {
  flex: { src: "gym/flex.mp4", filter: "brightness(0.6) contrast(1.2)" }, // 0–3.4s: teal gym, 3.7s on: bright gym (double bicep at the end)
  lat: { src: "gym/lat_pull_down.mp4", zoom: 1.1 },
  row: { src: "gym/row.mp4", filter: "brightness(0.6) contrast(1.2)" },
  seated: { src: "gym/seated_rowing.mp4", zoom: 1.1 },
  c15: { src: "gym/C0015.mov" }, // backlit dumbbell rows (cut inside at 1.12s)
  c22: { src: "gym/C0022.MP4", zoom: 1.1 }, // 0–1.4s: cable handle b-roll, 2.3s on: close-grip pulldown
};

// The track's big hits land every ~1.45s (frames 112, 155, 199, 243, 286, 330, 374, 417).
// Shots below are timed so cuts fall on those hits and the smaller hits between them.
const shots: Shot[] = [
  { clip: "c15", at: 0.0, frames: 11, white: [0, 2] }, // drop: white flash into backlit rows
  { clip: "lat", at: 1.0, frames: 22, punch: true }, // big hit 3.73s
  { clip: "row", at: 0.6, frames: 11 },
  { clip: "seated", at: 0.7, frames: 10 },
  {
    clip: "c22",
    at: 2.3,
    frames: 22,
    punch: true,
    enter: "diagonal",
    split: { clip: "row", at: 3.0 },
  }, // big hit 5.18s
  { clip: "flex", at: 1.4, frames: 22, push: true },
  { clip: "c15", at: 1.3, frames: 11, punch: true }, // big hit 6.64s
  { clip: "c22", at: 0.2, frames: 22 }, // b-roll: cable handle
  { clip: "lat", at: 3.6, frames: 11 },
  { clip: "row", at: 2.0, frames: 18, punch: true, enter: "shrink" }, // big hit 8.09s: previous shot shrinks away
  { clip: "seated", at: 2.2, frames: 20, whip: true },
  { clip: "row", at: 1.5, frames: 5, white: [0, 5] },
  { clip: "row", at: 2.6, frames: 33, punch: true }, // big hit 9.54s
  { clip: "c22", at: 4.0, frames: 11, enter: "slices" }, // slices with inverted strips
  { clip: "c15", at: 1.6, frames: 22, punch: true }, // big hit 11.0s
  { clip: "flex", at: 6.4, frames: 11 },
  { clip: "lat", at: 4.5, frames: 5 }, // quick burst
  { clip: "seated", at: 4.4, frames: 6 },
  { clip: "flex", at: 11.8, frames: 11, punch: true }, // big hit 12.46s
  { clip: "row", at: 4.3, frames: 11 },
  { clip: "c22", at: 0.6, frames: 11, enter: "letterbox" }, // squeeze into a thin strip
  { clip: "flex", at: 12.6, frames: 37, glitch: [7, 21], blurOut: 11 }, // final hit 13.91s: strobe glitch, blur out
];

const INTRO = 101; // the DISCIPLINE section, until the drop
const cutsLength = shots.reduce((t, s) => t + s.frames, 0);

export const gymEdit: VideoScript = {
  brand: {
    name: "gym",
    logo: "",
    url: "",
    colors: {
      bg: "#000000",
      panel: "#000000",
      text: "#FFFFFF",
      textMuted: "rgba(255,255,255,0.6)",
      accent: "#E8261A",
      chrome: ["#555", "#eee", "#888", "#ddd"],
    },
  },
  music: { src: "sounds/cowbell.mp3", volume: 1, fade: false },
  caption: {
    text: "if not now, then when? \nif not you, then who?",
    font: "anton",
    uppercase: true,
    position: "center",
    size: 64,
  },
  scenes: [
    // {
    //   type: "text-behind",
    //   duration: INTRO,
    //   clips,
    //   base: { clip: "flex", at: 11.0, scale: 1.3, shiftX: 10 }, // double bicep, zoomed in and moved right so she covers the end of the word
    //   text: "DISCIPLINE",
    //   color: "#E8261A",
    //   textSize: 300,
    //   band: {
    //     centerY: 0.55,
    //     openAt: 16,
    //     heights: [190, 330],
    //     growAt: 58,
    //     hideAt: 88,
    //   },
    //   flashFrom: 36,
    //   flashEvery: 3,
    //   flashes: [
    //     { clip: "c22", at: 0.3 },
    //     { clip: "lat", at: 1.2 },
    //     { clip: "row", at: 0.9 },
    //     { clip: "seated", at: 1.0 },
    //     { clip: "c15", at: 0.4 },
    //     { clip: "c22", at: 2.6 },
    //     { clip: "lat", at: 2.4 },
    //     { clip: "row", at: 2.2 },
    //     { clip: "seated", at: 2.9 },
    //     { clip: "c15", at: 2.0 },
    //     { clip: "c22", at: 1.0 },
    //     { clip: "lat", at: 5.0 },
    //     { clip: "row", at: 3.4 },
    //     { clip: "seated", at: 4.0 },
    //     { clip: "c15", at: 0.9 },
    //     { clip: "c22", at: 3.4 },
    //     { clip: "lat", at: 0.4 },
    //   ],
    //   silhouetteAt: 95,

    //   cutout: { folder: "gym/flex-cutout", count: 102 },
    // },

    {
      type: "footage-cuts",
      duration: INTRO,
      clips,
      shots: [
        { clip: "c22", at: 0.3, frames: 14, punch: true }, // lands on the first hit
        { clip: "lat", at: 1.2, frames: 3 },
        { clip: "row", at: 0.9, frames: 2 },
        { clip: "seated", at: 1.0, frames: 3 },
        { clip: "c15", at: 0.4, frames: 3 },
        { clip: "c22", at: 2.6, frames: 3 },
        { clip: "lat", at: 2.4, frames: 2 },
        { clip: "row", at: 2.2, frames: 3 },
        { clip: "seated", at: 2.9, frames: 3 },
        { clip: "c15", at: 2.0, frames: 2 },
        { clip: "c22", at: 1.0, frames: 3 },
        { clip: "lat", at: 5.0, frames: 3 },
        { clip: "row", at: 3.4, frames: 2 },
        { clip: "seated", at: 4.0, frames: 3 },
        { clip: "c15", at: 0.9, frames: 3 },
        { clip: "c22", at: 3.4, frames: 3 },
        { clip: "lat", at: 0.4, frames: 46, push: true }, // the calm before the drop
      ],
    },
    { type: "footage-cuts", duration: cutsLength, clips, shots },
  ],
};
