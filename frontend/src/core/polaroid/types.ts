// Everything for the polaroid scenes lives in this folder, so adding it never touches your other scenes.

export type FrameName = "cream" | "white" | "black";
export type CaptionFontName = "marker" | "caveat" | "shadows";

/** The polaroid effect's sliders, all 0–100 like in the app. */
export type PolaroidLook = {
  intensity: number;
  fade: number;
  warmth: number;
  shadowTint: number;
  softness: number;
  grain: number;
  vignette: number;
  lightLeak: number;
};

/** A slider that sweeps from `from` to `to` between frames `start` and `end`. It drives `param` on the photo. */
export type PolaroidSlider = {
  param: keyof PolaroidLook;
  label: string;
  from: number;
  to: number;
  start: number;
  end: number;
};

type Base = { type: "polaroid"; duration: number };

/** Camera flash on the original photo, then the polaroid drops in and develops. */
export type PolaroidHook = Base & {
  mode: "hook";
  original: string; // full photo, shown before the flash
  photo: string; // the real export (square), shown in the card
  caption: string; // typed under the photo
  headline: string;
  kicker?: string;
  flashAt: number; // frame of the flash
  frame?: FrameName;
};

/** The card with sliders sweeping; the photo changes live as they move. */
export type PolaroidTune = Base & {
  mode: "tune";
  headline: string;
  original: string; // square photo, no effect
  photo: string; // the real export (square): the live photo crossfades into it at `revealAt`
  sliders: PolaroidSlider[];
  revealAt?: number;
  cardEnter?: boolean; // false = card is already there (continues from the previous scene)
  frame?: FrameName;
  caption?: string;
  panelTitle?: string;
};

/** Pills switching between frame colors; the card follows. */
export type PolaroidFrames = Base & {
  mode: "frames";
  headline: string;
  photo: string;
  caption: string;
  changes: { at: number; frame: FrameName }[]; // first one must be at: 0
  panelTitle?: string;
};

/** The caption gets typed, then the font changes. */
export type PolaroidCaption = Base & {
  mode: "caption";
  headline: string;
  photo: string;
  frame?: FrameName;
  text: string;
  typeFrom: number;
  perChar: number; // frames per letter
  fonts: { at: number; font: CaptionFontName }[]; // first one must be at: 0
  panelTitle?: string;
};

/** One card in the pile. Give it `look` (made live from `original`) or `real` (an actual export). */
export type PileCard = {
  at: number; // frame it drops in
  x: number; // offset from the center, px at 1080 wide
  y: number;
  rot: number; // degrees
  width: number; // px at 1080 wide
  frame: FrameName;
  caption: string;
  font?: CaptionFontName;
  look?: Partial<PolaroidLook>;
  real?: string;
  zoom?: number; // zoom into the photo
  position?: string; // where to zoom, e.g. "75% 15%"
};

/** Cards dropping on top of each other, one look each. */
export type PolaroidPile = Base & {
  mode: "pile";
  headline: string;
  original: string;
  cards: PileCard[];
};

export type PolaroidSceneData = PolaroidHook | PolaroidTune | PolaroidFrames | PolaroidCaption | PolaroidPile;
