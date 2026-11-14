import type { Themes } from "../../gym/theme";

// ─────────────────────────────────────────────────────────────
// MIRROR edit: every shot breathes in (blurry + overexposed → sharp),
// drifts darker, zooms slowly in or out, and goes soft on the way out.
// Cuts every 2 beats of the track (117 BPM). 30 frames = 1s.
// ─────────────────────────────────────────────────────────────

export type MirrorShot = {
  clip: string; // key in `clips`
  at: number; // second in the clip where the shot starts
  frames: number;
  rate?: number; // playback speed: 0.5 = half-speed slow motion (default 0.6)
  zoom?: "in" | "out"; // the slow zoom through the shot
  amount?: number; // how much it zooms, default 0.1 (10%)
  position?: string; // which part of the frame to keep and zoom toward, e.g. "50% 30%" for her face
  blend?: boolean; // softens stepping in slow motion on 24/30fps clips (heavier to render)
  blurOut?: boolean; // last 2 frames go soft into the next shot (default true)
  fadeIn?: number; // frames fading in from black
  fadeOut?: number; // frames fading out to black
  note?: string; // what this shot should show (also shown on the placeholder)
  reverse?: boolean;
};

export type MirrorContent = {
  music: string;
  clips: Record<string, { src: string; note?: string }>; // empty src = a placeholder card
  shots: MirrorShot[];
  theme?: Themes; // black and white / color boost, like the gym videos
  grade?: string; // the base look, a CSS filter
  grain?: number; // 0–1
  vignette?: number; // 0–1
};

export const mirrorEdit: MirrorContent = {
  music: "dream/mirror/track.mp3",

  // Fill in your files (paths in /public). Until then each shot shows a placeholder.
  clips: {
    mirror: {
      src: "dream/mirror/IMG_5065.MP4",
      note: "her in the mirror, wide",
    },
    close: {
      src: "dream/mirror/IMG_5066.MP4",
      note: "close-up of her face or reflection",
    },

    photo1: { src: "dream/mirror/photo.jpeg", note: "photo: mirror selfie" },
    photo2: { src: "dream/mirror/photo2.jpeg", note: "photo: close-up" },
    photo3: { src: "dream/mirror/photo3.jpeg", note: "photo: mirror selfie" },
  },

  shots: [
    // intro (quiet part of the track)
    {
      clip: "mirror",
      at: 31.3,
      frames: 37,
      rate: 0.5,
      zoom: "in",
      fadeIn: 10,
      note: "opening: her in the mirror",
    },
    {
      clip: "close",
      at: 18.0,
      frames: 31,
      rate: 0.5,
      zoom: "out",
      position: "50% 35%",
      note: "face, looking at herself",
    },
    {
      clip: "close",
      at: 19.0,
      frames: 31,
      rate: 0.5,
      zoom: "in",
      position: "50% 35%",
      note: "face, looking at herself",
    },

    // {
    //   clip: "close",
    //   at: 21.0,
    //   frames: 31,
    //   rate: 0.5,
    //   zoom: "in",
    //   position: "50% 35%",
    //   note: "face, looking at herself",
    // },

    // the drop at 2.28s: a cut every 2 beats from here

    // ending: slow, then fades to black with the music

    {
      clip: "close",
      at: 43.0,
      frames: 31,
      rate: 0.5,
      zoom: "in",
      position: "50% 35%",
      note: "close on the reflection",
    },
    {
      clip: "close",
      at: 44.0,
      frames: 31,
      rate: 0.5,
      zoom: "out",
      position: "50% 35%",
      note: "close on the reflection",
    },
    {
      clip: "close",
      at: 45.0,
      frames: 31,
      rate: 0.5,
      zoom: "in",
      position: "50% 35%",
      note: "close on the reflection",
    },
    // {
    //   clip: "close",
    //   at: 49.0,
    //   frames: 31,
    //   rate: 0.5,
    //   zoom: "in",
    //   position: "50% 35%",
    //   note: "reverse it",
    // },

    // {
    //   clip: "mirror",
    //   at: 43.0,
    //   frames: 40,
    //   rate: 0.5,
    //   zoom: "out",
    //   blurOut: false,
    //   fadeOut: 14,
    //   note: "ending",
    // },
    {
      clip: "close",
      at: 2.0,
      frames: 31,
      rate: 0.5,
      zoom: "out",
      position: "50% 35%",
      note: "face, looking at herself",
    },
    {
      clip: "mirror",
      at: 48.5,
      frames: 40,
      rate: 0.5,
      zoom: "in",
      blurOut: false,
      fadeOut: 14,
      note: "ending",
    },

    {
      clip: "mirror",
      at: 50.5,
      frames: 37,
      rate: 0.5,
      zoom: "out",
      blurOut: false,
      fadeOut: 14,
      note: "ending",
    },
  ],

  theme: {
    blackAndWhite: false,
    colorBoost: false,
    bw: { contrast: 1.15 },
    boost: { amount: 1.6 },
  },
  grade: "saturate(0.88) contrast(2.0) sepia(0.12) brightness(0.8)", // warm and soft, like the reference
  // grain: 0.12,
  vignette: 1,
};

/** Total length in frames: the shots back to back. */
export const mirrorDuration = (c: MirrorContent) =>
  c.shots.reduce((t, s) => t + s.frames, 0);
