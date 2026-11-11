import type {
  CompClip,
  CompCutout,
  CompLayer,
  CompShot,
} from "../../core/composite/types";
import type { VideoScript } from "../../core/types";

// Cut to the reference frame by frame (30 frames = 1s). The cuts land on the track's hits.

// const clips: Record<string, CompClip> = {
//   opening: { src: "gym/shoulders/opening.mp4" },
//   broll: { src: "gym/shoulders/b-roll3.mp4" },
//   shrugs: { src: "gym/shoulders/shrugs-20kgs.mp4" },
//   overhead: { src: "gym/shoulders/overhead.mp4" },
//   facepulls: { src: "gym/shoulders/face-pulls.mov" },
// };

const clips: Record<string, CompClip> = {
  opening: { src: "gym/shoulders/flexing.mov" },
  broll: { src: "gym/shoulders/b-roll2.mov" },
  shrugs: { src: "gym/shoulders/shrugs-20kgs.mp4" },
  overhead: { src: "gym/shoulders/overhead.mp4" },
  raises: { src: "gym/shoulders/raises-standing.mp4" },
};

// Her cutout, made from opening.mp4 between 2.4s and 3.8s (see setup). Fill in count after making it.
const cutouts: Record<string, CompCutout> = {
  her: {
    folder: "gym/shoulders/her-cutout",
    start: 2.4,
    fps: 30,
    count: 42,
  },
};

const POS = "75% 50%"; // framing for opening.mp4 and her cutout (keep them the same so they line up)

// Empty gym "plates": zoomed into parts of clips where she isn't.
const plate = {
  wall: (at: number): CompLayer => ({
    kind: "clip",
    clip: "overhead",
    at,
    position: "100% 50%",
    zoom: 1.4,
    drift: 0.04,
  }),
  gym: (at: number): CompLayer => ({
    kind: "clip",
    clip: "raises",
    at,
    position: "0% 50%",
    zoom: 1.4,
    drift: 0.04,
  }),
  racks: (at: number): CompLayer => ({
    kind: "clip",
    clip: "shrugs",
    at,
    position: "100% 50%",
    zoom: 1.7,
    drift: 0.04,
  }),
};
const her = (
  at: number,
  extra: Partial<Extract<CompLayer, { kind: "cutout" }>> = {},
): CompLayer => ({
  kind: "cutout",
  cutout: "her",
  at,
  position: POS,
  ...extra,
});
const OK: CompLayer = {
  kind: "text",
  text: "OK",
  size: 0.75,
  spacing: "0.35em",
  x: 10,
  opacity: 0.32,
}; // x: 10 centers it on her

const shots: CompShot[] = [
  // 0.00 — opening; a small clone of her appears in the back as a white silhouette, circled
  {
    frames: 19,
    layers: [
      { kind: "clip", clip: "opening", at: 0.3, position: POS, drift: 0.05 },
      her(2.4, { scale: 0.45, x: 26, y: -6, appear: 13, white: [13, 15] }),
      { kind: "circle", x: 77, y: 76, r: 20, appear: 13, until: 17 },
    ],
  },
  // 0.63 — white flash; the clone stands alone in an empty corner; a scribble flickers
  {
    frames: 20,
    flash: "white",
    layers: [
      plate.wall(2.0),
      {
        kind: "clip",
        clip: "opening",
        at: 4.5,
        zoom: 1.0,
        drift: 0.05,
        position: "10% 50%",
        opacity: 0.7,
      },
      // her(2.6, { scale: 0.5, x: 20, y: -4 }),
      { kind: "scribble", text: "shoulder day", x: 12, y: 16, until: 3 },
    ],
  },
  // 1.30 — close-up
  {
    frames: 13,
    layers: [
      {
        kind: "clip",
        clip: "shrugs",
        at: 1.2,
        position: "25% 50%",
        zoom: 1.5,
        drift: 0.06,
      },
    ],
  },
  // 1.73 — she stays in place, the gym behind her swaps
  {
    frames: 11,
    layers: [{ kind: "clip", clip: "raises", at: 4.5, zoom: 1.2, drift: 0.05 }],
  },
  {
    frames: 10,
    layers: [
      {
        kind: "clip",
        clip: "overhead",
        at: 1.5,
        position: "20% 50%",
        zoom: 1.3,
      },
    ],
  },
  // 2.43 — negative flash, spinning blur, a blurry detail, black
  {
    frames: 1,
    flash: "invert",
    layers: [{ kind: "clip", clip: "broll", at: 0.2 }],
  },
  { frames: 11, layers: [{ kind: "clip", clip: "broll", at: 1.2, spin: 24 }] },
  {
    frames: 5,
    layers: [{ kind: "clip", clip: "broll", at: 1.7, zoom: 2.4, soft: 6 }],
  },
  { frames: 2, layers: [] },
  // 3.07 — double exposure
  {
    frames: 10,
    layers: [
      { kind: "clip", clip: "overhead", at: 3.0 },
      {
        kind: "clip",
        clip: "raises",
        at: 9.0,
        blend: "screen",
        opacity: 0.55,
      },
    ],
  },
  // 3.40 — her over the gym, white silhouette, then a dark silhouette while the background swaps
  {
    frames: 19,
    layers: [
      plate.gym(4.0),
      her(2.7, { until: 12 }),
      her(2.7, { appear: 12, until: 14, white: [12, 14] }),
      her(2.7, { appear: 14, dark: true }),
    ],
  },
  { frames: 13, layers: [plate.wall(4.0), her(3.33, { dark: true })] },
  // 4.47 — the pose; it blows out bright and "OK" appears behind her
  {
    frames: 16,
    bright: [6, 16],
    layers: [
      { kind: "clip", clip: "opening", at: 2.85, position: POS },
      { ...OK, appear: 6 },
      her(2.85, { appear: 6 }),
    ],
  },
  // 5.00 — same pose over another background; a mirrored white clone appears in front
  {
    frames: 12,
    layers: [
      {
        kind: "clip",
        clip: "overhead",
        at: 5.0,
        position: "20% 50%",
        zoom: 1.3,
      },
      OK,
    ],
  },
  // 5.40 — wide, from behind
  { frames: 7, layers: [{ kind: "clip", clip: "raises", at: 9.6 }] },
  // 5.63 — spinning blur, then the last move, washing out
  {
    frames: 11,
    layers: [{ kind: "clip", clip: "overhead", at: 5.0, spin: 20 }],
  },
  {
    frames: 10,
    bright: [6, 10],
    layers: [{ kind: "clip", clip: "raises", at: 4.4, drift: 0.06 }],
  },
  {
    frames: 6,
    whiteOut: 6,
    layers: [{ kind: "clip", clip: "raises", at: 3.5, drift: 0.06 }],
  },
  // 6.53 — black while the music finishes
  { frames: 26, layers: [] },
];

export const shouldersOk: VideoScript = {
  brand: {
    name: "shoulders",
    logo: "",
    url: "",
    colors: {
      bg: "#000000",
      panel: "#000000",
      text: "#FFFFFF",
      textMuted: "rgba(255,255,255,0.6)",
      accent: "#FFFFFF",
      chrome: ["#555", "#eee", "#888", "#ddd"],
    },
  },
  music: { src: "gym/shoulders/track.mp3", volume: 1, fade: false },
  scenes: [
    {
      type: "composite",
      duration: shots.reduce((t, s) => t + s.frames, 0),
      clips,
      cutouts,
      shots,
      mono: true,
    },
  ],
};
