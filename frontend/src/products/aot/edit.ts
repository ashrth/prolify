import type {
  DialogueLine,
  DialogueShot,
  FootageClip,
  VideoScript,
} from "../../core/types";

// All timings are in frames (30 = 1 second), measured from the reference video,
// so the words and cuts land exactly where the dialogue and music do.

const clips: Record<string, FootageClip> = {
  sitting: { src: "aot/sitting.mp4" },
  self: { src: "aot/self-fixed.mov" },
  rotate: { src: "aot/rotate.mp4" },
  hip: { src: "aot/hip_thrust.mov" },
  sumo: { src: "aot/sumo_squats.mov" },
  squats: { src: "aot/sqauts.mov" },
  step: { src: "aot/step-ups.mov" },
  bulg: { src: "aot/bulgarians.mp4" },
  walking: { src: "aot/walking.mp4" },
};

// ─── The dialogue: [start frame, end frame, text] ───────────
const lines: DialogueLine[] = [
  { at: 0, until: 31, text: "Sorry," },
  { at: 31, until: 52, text: "I don't have any" },
  { at: 52, until: 67, text: "heartstrings" },
  { at: 67, until: 84, text: "left for you" },
  { at: 84, until: 108, text: "to tug on." },
  { at: 118, until: 129, text: "You want" },
  { at: 129, until: 147, text: "compassion?" },
  { at: 168, until: 186, text: "Move on." },
  { at: 198, until: 222, text: "You want fair?" },
  { at: 231, until: 250, text: "Tough shit." },
  { at: 280, until: 315, text: "Time's wasted." },
  { at: 324, until: 349, text: "Pick your side," },
  { at: 349, until: 363, text: "Christa." },
  { at: 396, until: 411, text: "Eren..." },
  { at: 432, until: 451, text: "or the bitch" },
  { at: 451, until: 468, text: "I'm gonna" },
  { at: 468, until: 481, text: "KILL", big: true }, // the music drops here
];

// ─── The fast cuts, from the drop to the end ───────────────
// The music hits every ~6 frames; shots are 6, 12, 18 or 24 frames so every cut lands on a hit.
const CUTS_FROM = 478;
const shots: DialogueShot[] = [
  { clip: "rotate", at: 0.5, frames: 12, whip: true },
  { clip: "hip", at: 5.0, frames: 18, punch: true },
  { clip: "squats", at: 10.0, frames: 18, punch: true },
  { clip: "sumo", at: 2.8, frames: 12 },
  { clip: "hip", at: 7.0, frames: 18, punch: true },
  { clip: "step", at: 4.0, frames: 12 },
  {
    clip: "self",
    at: 1.5,
    frames: 18,
    red: true,
    fill: "cover",
    position: "55% 50%",
    punch: true,
  },
  { clip: "bulg", at: 4.0, frames: 12, whip: true },
  { clip: "squats", at: 5.0, frames: 6 },
  { clip: "sumo", at: 5.0, frames: 6 },
  { clip: "rotate", at: 1.4, frames: 12, whip: true },
  { clip: "sumo", at: 5.8, frames: 12 },
];

const DURATION = CUTS_FROM + shots.reduce((t, s) => t + s.frames, 0); // 646 frames = 21.5s, the length of the audio

const make = (theme: "bw" | "color"): VideoScript => ({
  brand: {
    name: "aot",
    logo: "",
    url: "",
    colors: {
      bg: "#000000",
      panel: "#000000",
      text: "#FFFFFF",
      textMuted: "rgba(255,255,255,0.6)",
      accent: "#B0000E",
      chrome: ["#555", "#eee", "#888", "#ddd"],
    },
  },
  music: { src: "aot/mikasa.mp3", volume: 1, fade: false },
  scenes: [
    {
      type: "dialogue",
      duration: DURATION,
      theme,
      textColor: "#B0000E", // blood red
      clips,
      lines,
      backdrops: [
        {
          from: 0,
          to: 118,
          clip: "step",
          at: 1.0,
          rate: 0.5,
          opacity: 0.5,
          blur: 2,
          zoom: [1.05, 1.15],
        }, // "Sorry… to tug on."
        {
          from: 118,
          to: 198,
          clip: "walking",
          at: 3.0,
          rate: 0.5,
          opacity: 0.5,
          blur: 2,
          zoom: [1.05, 1.15],
        }, // "You want compassion? Move on."
        {
          from: 198,
          to: 280,
          clip: "bulg",
          at: 2.0,
          rate: 0.5,
          opacity: 0.5,
          blur: 2,
          zoom: [1.05, 1.15],
        }, // "You want fair? Tough shit."
        {
          from: 280,
          to: 396,
          clip: "squats",
          at: 2.0,
          rate: 0.5,
          opacity: 0.5,
          blur: 2,
          zoom: [1.05, 1.15],
        }, // "Time's wasted… Christa."
        {
          from: 396,
          to: 432,
          clip: "rotate",
          at: 0.3,
          rate: 0.4,
          opacity: 0.5,
          blur: 2,
          zoom: [1.05, 1.15],
        }, // "Eren..."
        {
          // "or the bitch I'm gonna KILL": push in on her bowed head, punch on KILL, whip into the cuts
          from: 432,
          to: CUTS_FROM,
          clip: "sitting",
          at: 4.0,
          position: "75% 50%", // keeps her centered when cropping to vertical
          zoom: [1.1, 1.7],
          origin: "67% 38%", // her head
          punchAt: 468,
          whipOut: 6,
        },
      ],
      cutsFrom: CUTS_FROM,
      shots,
    },
  ],
});

export const aotBW = make("bw");
export const aotColor = make("color");
