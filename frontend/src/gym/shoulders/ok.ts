import type {
  CompClip,
  CompCutout,
  CompLayer,
  CompShot,
} from "../../core/composite/types";
import type { VideoScript } from "../../core/types";

// Cut to the reference frame by frame (30 frames = 1s). The cuts land on the track's hits.

const clips: Record<string, CompClip> = {
  opening: { src: "gym/shoulders/media/opening.mp4" },
  broll: { src: "gym/shoulders/media/b-roll3.mp4" },
  shrugs: { src: "gym/shoulders/media/shrugs-20kgs.mp4" },
  overhead: { src: "gym/shoulders/media/overhead.mp4" },
  facepulls: { src: "gym/shoulders/media/face-pulls.mov" },
};

// Her cutout, made from opening.mp4 between 2.4s and 3.8s (see setup). Fill in count after making it.
const cutouts: Record<string, CompCutout> = {
  her: {
    folder: "gym/shoulders/media/her-cutout",
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
    clip: "facepulls",
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
      her(2.6, { scale: 0.5, x: 20, y: -4 }),
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
  { frames: 11, layers: [plate.gym(3.2), her(2.4)] },
  { frames: 10, layers: [plate.wall(3.0), her(2.77)] },
  // 2.43 — negative flash, spinning blur, a blurry detail, black
  {
    frames: 1,
    flash: "invert",
    layers: [{ kind: "clip", clip: "broll", at: 0.2 }],
  },
  { frames: 11, layers: [{ kind: "clip", clip: "broll", at: 1.2, spin: 24 }] },
  {
    frames: 5,
    layers: [{ kind: "clip", clip: "broll", at: 0.5, zoom: 2.4, soft: 6 }],
  },
  { frames: 2, layers: [] },
  // 3.07 — double exposure
  {
    frames: 10,
    layers: [
      { kind: "clip", clip: "overhead", at: 3.0 },
      {
        kind: "clip",
        clip: "facepulls",
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
      plate.racks(2.0),
      OK,
      her(3.38),
      her(3.38, {
        mirror: true,
        scale: 0.8,
        x: -22,
        appear: 8,
        white: [8, 10],
      }),
    ],
  },
  // 5.40 — wide, from behind
  { frames: 7, layers: [{ kind: "clip", clip: "facepulls", at: 9.6 }] },
  // 5.63 — spinning blur, then the last move, washing out
  {
    frames: 11,
    layers: [{ kind: "clip", clip: "overhead", at: 5.0, spin: 20 }],
  },
  {
    frames: 10,
    bright: [6, 10],
    layers: [{ kind: "clip", clip: "facepulls", at: 10.4, drift: 0.06 }],
  },
  {
    frames: 6,
    whiteOut: 6,
    layers: [{ kind: "clip", clip: "facepulls", at: 10.73, drift: 0.06 }],
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
  music: { src: "shoulders/media/track.mp3", volume: 1, fade: false },
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
