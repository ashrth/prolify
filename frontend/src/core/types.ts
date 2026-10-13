// ─────────────────────────────────────────────────────────────
// Core types. A video is just: a brand + a list of scenes.
// Every scene has a `type` (which component renders it) and a
// `duration` in frames (30 frames = 1 second).
// ─────────────────────────────────────────────────────────────

export type EnterPreset =
  | "slam" // scales down from big + blur, snappy. Hooks, punchlines.
  | "rise" // fades up from below, smooth. Captions, supporting text.
  | "mask-up" // slides up from behind an invisible edge. Titles, lists.
  | "blur-in" // sharpens out of a blur. Premium, calm moments.
  | "pop" // springs in with overshoot. Buttons, logos, small things.
  | "fade" // plain fade.
  | "none";

export type Brand = {
  name: string; // shown in the CTA wordmark
  logo: string; // path inside /public, e.g. "x657o/logo.svg"
  url: string;
  colors: {
    bg: string;
    panel: string;
    text: string;
    textMuted: string;
    accent: string; // used sparingly: logo glow
    chrome: [string, string, string, string]; // dark → light → mid → light, for chrome text
  };
};

export type HookScene = {
  type: "hook";
  duration: number;
  lines: string[];
  cards: string[]; // images for the floating 3D card wall
};

export type StrikeListScene = {
  type: "strike-list";
  duration: number;
  items: string[]; // each one appears, then gets crossed out
};

export type EffectFlipScene = {
  type: "effect-flip";
  duration: number; // should be >= effects.length * framesPerEffect + ~35 for the outro
  framesPerEffect: number;
  effects: { name: string; image: string }[];
  outro?: string; // e.g. "AND MORE." — shows all effects as a mosaic
};

export type BrowserDemoScene = {
  type: "browser-demo";
  duration: number;
  screenshot: string;
  aspect: number; // screenshot width / height
  url: string;
  caption: string[]; // first line white, rest muted
  click?: { x: number; y: number; atFrame: number }; // x/y are 0–1 inside the screenshot
};

export type StepsScene = {
  type: "steps";
  duration: number;
  steps: string[];
  image: string;
  aspect: number;
};

export type StatementScene = {
  type: "statement";
  duration: number;
  kicker?: string;
  headline: string; // rendered in liquid chrome
  sub?: string;
};

export type CtaScene = {
  type: "cta";
  duration: number;
  button: string;
  url: string;
};

export type Scene =
  | HookScene
  | StrikeListScene
  | EffectFlipScene
  | BrowserDemoScene
  | StepsScene
  | StatementScene
  | CtaScene;



export type SoundCue = {
  src: string;     // path in /public
  scene: number;   // which scene (0 = first)
  at?: number;     // frame inside that scene
  volume?: number; // 0–1
};

export type VideoScript = {
  brand: Brand;
  scenes: Scene[];
  music?: { src: string; volume?: number };
  sfx?: SoundCue[];
};