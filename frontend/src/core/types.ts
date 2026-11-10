import type { FontName } from "./fonts";
import type { PolaroidSceneData } from "./polaroid/types";

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
  | {
      kind: "watermark";
      image: string;
      aspect: number;
      text: string;
      strikeAt: number;
      removeAt: number;
    }
  | {
      kind: "steps";
      framesPer: number;
      aspect: number;
      steps: { image: string; label: string }[];
    }; // e.g. pixelated → sharp

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
  objectPosition?: string; // which part of the image to keep when cropping, e.g. "70% 50%"
};

/** Full-bleed: a glowing line scans down, turning `before` into `after`. Headline slams in after. */
export type ScanRevealScene = {
  type: "scan-reveal";
  duration: number;
  before: string;
  after: string;
  scanFrom: number;
  scanTo: number;
  objectPosition?: string;
  headline: string;
  sub?: string;
};

/** One section of an effect's control panel. Things change at frame `at`. */
export type ControlSection =
  | { kind: "title"; text: string }
  | {
      kind: "pills";
      label?: string;
      options: string[];
      columns?: number;
      select: { at: number; index: number }[];
    }
  | {
      kind: "swatch";
      label?: string;
      colors: { at: number; color: string }[];
      showAt?: number;
    }
  | { kind: "slider"; slider: PanelSlider };

/** A source video file used by footage scenes. */
export type FootageClip = {
  src: string; // path in /public
  zoom?: number; // e.g. 1.1 to hide black bars baked into the clip
  objectPosition?: string;
  filter?: string; // extra adjustment for this clip, e.g. "brightness(0.8) contrast(1.3)"
};

/** One shot in a footage edit: `frames` long, starting `at` seconds into the clip. */
export type Shot = {
  clip: string; // key in `clips`
  at: number;
  frames: number;
  enter?: "cut" | "slices" | "shrink" | "letterbox" | "diagonal"; // how it comes in (default: hard cut)
  split?: { clip: string; at: number }; // second clip for enter: "diagonal"
  punch?: boolean; // zooms in hard on the first frames, for big hits
  push?: boolean; // slow zoom through the shot
  whip?: boolean; // whips in from the side with blur
  white?: [number, number]; // frames (inside the shot) shown as a white high-contrast flash
  glitch?: [number, number]; // frames of strobe + streak glitch
  blurOut?: number; // last N frames blur and fade to black
};

export type FootageCutsScene = {
  type: "footage-cuts";
  duration: number;
  clips: Record<string, FootageClip>;
  shots: Shot[];
};

/** A clip with big text behind the person, inside a band that opens up and flashes other clips. */
export type TextBehindScene = {
  type: "text-behind";
  duration: number;
  clips: Record<string, FootageClip>;
  base: { clip: string; at: number; scale?: number; shiftX?: number }; // shiftX: % of width, moves the person sideways (applied to the cutout too)
  text: string;
  color: string;
  band: {
    centerY: number; // 0–1, vertical position of the band
    openAt: number; // frame the band starts opening
    heights: [number, number]; // band height after opening, and after growing (px at 1080p)
    growAt: number; // frame it starts growing to the second height
    hideAt: number; // frame the band and text disappear
  };
  textSize: number; // px at 1080p
  flashes: { clip: string; at: number }[]; // clips flashing inside the band
  flashFrom: number;
  flashEvery: number;
  silhouetteAt?: number; // frame of the white silhouette flash
  cutout?: { folder: string; count: number }; // PNG frames of the person with no background
};

/** A line of dialogue on screen from frame `at` until frame `until`. */
export type DialogueLine = {
  at: number;
  until: number;
  text: string;
  big?: boolean;
};

/** A clip shown full screen behind the dialogue, pushing in. */
export type DialogueBackdrop = {
  from: number; // scene frame it appears
  to: number; // scene frame it ends
  clip: string;
  at: number; // seconds into the clip
  position?: string; // which part to keep when cropping to 9:16
  zoom?: [number, number]; // scale at start and end, e.g. [1.2, 2.2]
  origin?: string; // the point it zooms toward, e.g. "70% 40%"
  punchAt?: number; // scene frame of a hard zoom punch + shake (for the big word)
  whipOut?: number; // last N frames blur out sideways into the cuts
  opacity?: number; // 0–1, e.g. 0.3 for a faint background
  blur?: number; // px, softens it so the text stays the focus
  rate?: number; // playback speed, e.g. 0.5 for slow motion
};

/** One shot in the fast cuts. */
export type DialogueShot = {
  clip: string;
  at: number;
  frames: number;
  rate?: number;
  fill?: "blur" | "cover"; // blur = whole 16:9 frame in the middle, blurred copy behind (like the reference); cover = full screen
  position?: string;
  red?: boolean; // blood-red grade, in either theme
  whip?: boolean; // enters with a sideways motion blur
  punch?: boolean; // zooms in hard on the first frames
};

/** Dialogue on black, a clip behind the final words, then fast cuts on the drop. */
export type DialogueScene = {
  type: "dialogue";
  duration: number;
  theme: "bw" | "color";
  textColor: string;
  clips: Record<string, FootageClip>;
  lines: DialogueLine[];
  backdrops: DialogueBackdrop[];
  cutsFrom: number; // scene frame the fast cuts start
  shots: DialogueShot[];
};

/** A video used by a dream edit. */
export type DreamClip = { src: string };

/** A cutout (PNG frames with no background), made with rembg from a whole clip. */
export type DreamCutout = {
  folder: string; // e.g. "dream/woman1-cutout"
  fps: number; // the frame rate of the clip it was made from (from ffprobe)
  count: number; // number of PNGs in the folder
};

/** One layer of a dream shot: a clip, a photo, or a cutout. */
export type DreamLayer = {
  clip?: string; // key in `clips`
  image?: string; // path to a photo in /public
  cutout?: string; // key in `cutouts`
  at?: number; // seconds into the clip / cutout where this shot starts (default 0)
  rate?: number; // playback speed: 0.5 = half-speed slow motion (default 1)
  position?: string; // which part to keep when cropping to 9:16, e.g. "30% 50%" (default center)
  zoom?: number; // scale up, e.g. 1.2
  drift?: "in" | "out" | "left" | "right" | "up" | "down"; // slow camera move through the shot
  blend?:
    | "normal"
    | "screen"
    | "lighten"
    | "overlay"
    | "soft-light"
    | "multiply"; // how it mixes with layers below
  opacity?: number;
  appear?: {
    at: number;
    frames: number;
    how: "fade" | "wipe-down" | "wipe-right" | "left-half" | "right-half";
  }; // layer comes in mid-shot
};

export type DreamShot = {
  frames: number;
  layers: DreamLayer[]; // bottom to top; empty = black
  flash?: "white" | "black" | "white-black"; // flash frames at the very start
  echo?: boolean; // ghost trail on the top video layer
  glow?: number; // bloom on the highlights, 0–1
  soft?: number; // dreamy blur, px
  shake?: number; // handheld shake strength
  fadeIn?: number; // frames, from black
  whiteOut?: number; // last N frames wash out to white
};

/** A dreamy edit: layered, blended shots with flashes, ghosting and glow. */
export type DreamScene = {
  type: "dream";
  duration: number;
  clips: Record<string, DreamClip>;
  cutouts?: Record<string, DreamCutout>;
  shots: DreamShot[];
  mono?: boolean; // true = black and white
};

/** One photo in a PhotoStack. It enters at frame `at` and covers part (or all) of what's under it. */
export type StackStep = {
  at: number;
  image: string;
  region?: "full" | "left" | "right" | "top" | "bottom"; // default "full"
  enter?: "slide" | "fade"; // default: "slide" for halves, "fade" for full
};

/**
 * Personal-edit style: aligned photos layered on top of each other,
 * with a slow camera push, gentle sway and film grain. No text, no UI.
 */
export type PhotoStackScene = {
  type: "photo-stack";
  duration: number;
  steps: StackStep[];
  transition?: number; // frames each entrance takes, default 14
  objectPosition?: string;
  grain?: boolean;
  fadeOut?: number; // frames of fade to black at the end
};

/** Image on top, the effect's control panel below. Images and panel change on a timeline. */
export type EffectShowcaseScene = {
  type: "effect-showcase";
  duration: number;
  headline?: string;
  images: { at: number; image: string }[];
  aspect: number;
  imageWidth?: number; // default 820
  panel: ControlSection[];
};

/** A slider in the settings panel. Values animate from `from` to `to` between frames `start` and `end`. */
export type PanelSlider = {
  label: string;
  from: number;
  to: number;
  min?: number; // default 0
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
  | ScanRevealScene
  | EffectShowcaseScene
  | PhotoStackScene
  | FootageCutsScene
  | TextBehindScene
  | DreamScene
  | DialogueScene
  | PolaroidSceneData
) & { sounds?: SceneSound[]; font?: FontName };

/** A line of text that stays on screen over the whole video (or a part of it). */
export type Caption = {
  text: string;
  position?: "bottom" | "center" | "top"; // default "bottom"
  size?: number; // px at 1080p, default 64
  color?: string; // default white
  font?: FontName; // default: the video's font
  uppercase?: boolean;
  from?: number; // frame it appears (default 0)
  until?: number; // frame it disappears (default: the end of the video)
  fade?: number; // frames to fade in and out (default 12)
};

export type VideoScript = {
  brand: Brand;
  scenes: Scene[];
  music?: { src: string; volume?: number; fade?: boolean }; // fade: soft start and end (default true)
  caption?: Caption; // optional caption that appears over the whole video
};
