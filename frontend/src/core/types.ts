import type { FontName } from "./fonts";

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
  wordmark?: string; // overrides brand.name, e.g. lowercase "x657o"
};

/** Lines replace each other in quick cuts; the last one slams in bigger and holds. */
export type SwapHookScene = {
  type: "swap-hook";
  duration: number;
  framesPer: number;
  lines: { main: string; small?: string }[];
  sub?: string; // appears under the final line
};

export type FeatureVisual =
  | { kind: "flip"; images: string[]; framesPer: number } // rapid card cuts
  | { kind: "image"; image: string; aspect: number } // framed image, slow push-in
  | { kind: "watermark"; image: string; aspect: number; text: string; strikeAt: number; removeAt: number }
  | { kind: "steps"; framesPer: number; aspect: number; steps: { image: string; label: string }[] }; // e.g. pixelated → sharp

/** Big headline on top, one visual proving it underneath. */
export type FeatureScene = {
  type: "feature";
  duration: number;
  headline: string;
  visual: FeatureVisual;
};

export type PricingScene = {
  type: "pricing";
  duration: number;
  title: string;
  subtitle?: string;
  plans: { name: string; price: string; suffix: string; badge?: string }[]; // price like "$29"
  button: string;
  pick: number; // which plan the cursor clicks
  clickAt: number;
  note?: string; // appears after the click
};

export type ImageTitleScene = {
  type: "image-title";
  duration: number;
  image: string; // full-bleed background
  kicker?: string;
  headline: string;
  sub?: string;
};

export type FlashCutsScene = {
  type: "flash-cuts";
  duration: number; // usually items.length * framesPer
  framesPer: number;
  items: { image: string; label: string }[];
};

/** A slider in the settings panel. Values animate from `from` to `to` between frames `start` and `end`. */
export type PanelSlider = {
  label: string;
  from: number;
  to: number;
  max: number;
  suffix?: string; // "%", "°", ""
  start?: number; // omit start/end for a slider that doesn't move
  end?: number;
  drives?: "amount" | "centerX" | "centerY"; // what this slider controls in the live preview
};

export type EffectDemoScene = {
  type: "effect-demo";
  duration: number;
  title: string; // big label on the photo, e.g. "ZOOM"
  panelTitle: string; // e.g. "MOTION BLUR"
  modes: string[]; // the pill buttons
  activeMode: number;
  previousMode?: number; // highlighted before the click (omit = none)
  clickAt: number; // frame the pill gets clicked
  image: string; // sharp original
  result: string; // the app's real output, crossfaded in at revealAt
  aspect: number; // width / height of the photo
  blur: {
    kind: "linear" | "zoom" | "spin";
    full: number; // visual size when the "amount" slider reaches its `to` value (linear: fraction of width, zoom: extra scale, spin: degrees)
    angle?: number; // linear only, degrees
  };
  sliders: PanelSlider[];
  revealAt: number;
};

export type SceneSound = {
  src: string;
  at?: number; // frame inside the scene
  volume?: number;
  duration?: number; // cut the sound off after this many frames
};

export type Scene = (
  | HookScene
  | StrikeListScene
  | EffectFlipScene
  | BrowserDemoScene
  | StepsScene
  | StatementScene
  | CtaScene
  | ImageTitleScene
  | FlashCutsScene
  | EffectDemoScene
  | SwapHookScene
  | FeatureScene
  | PricingScene
) & { sounds?: SceneSound[]; font?: FontName };

export type VideoScript = {
  brand: Brand;
  scenes: Scene[];
  music?: { src: string; volume?: number };
};
