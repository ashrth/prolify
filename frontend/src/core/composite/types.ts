// A layered edit: every shot is a stack of layers (clips, a cutout of the person, big text, a circle, a scribble).
// Everything for it lives in this folder.

export type CompClip = { src: string };

/** PNG frames of the person with no background (made with rembg). */
export type CompCutout = {
  folder: string;
  start: number; // second in the source clip where the frames begin
  fps: number; // frames per second they were extracted at
  count: number; // number of PNGs
};

type Common = {
  opacity?: number;
  appear?: number; // frame (inside the shot) the layer shows up
  until?: number; // frame it disappears
};

export type CompLayer =
  | (Common & {
      kind: "clip";
      clip: string;
      at: number; // seconds into the clip
      rate?: number;
      position?: string; // which part of the 16:9 frame to keep, e.g. "100% 50%"
      zoom?: number; // zoom in (toward `position`), e.g. 1.4 to crop the person out
      drift?: number; // slow push-in over the shot, e.g. 0.06
      spin?: number; // spinning motion blur, in degrees
      blend?: "normal" | "screen" | "lighten" | "multiply";
      soft?: number; // blur, px
    })
  | (Common & {
      kind: "cutout";
      cutout: string;
      at: number; // seconds into the SOURCE clip (same timing as the clip it came from)
      rate?: number;
      position?: string; // keep the same as the clip it came from, so they line up
      zoom?: number;
      scale?: number; // shrink it to place her elsewhere, e.g. 0.55
      x?: number; // move sideways, % of width
      y?: number; // move down, % of height
      mirror?: boolean;
      white?: [number, number]; // frames shown as a solid white silhouette
      dark?: boolean; // a dark silhouette
    })
  | (Common & {
      kind: "text";
      text: string;
      size: number; // fraction of the video height, e.g. 1.1
      spacing?: string; // letter spacing, e.g. "0.45em"
      x?: number; // move sideways, % of width (to center the letters on the person)
      color?: string;
    })
  | (Common & { kind: "circle"; x: number; y: number; r: number }) // thin ring, % of width/height
  | (Common & { kind: "scribble"; text: string; x: number; y: number }); // handwriting + doodle lines

export type CompShot = {
  frames: number;
  layers: CompLayer[]; // bottom to top; empty = black
  flash?: "white" | "invert"; // a flash on the first frame
  bright?: [number, number]; // frames (inside the shot) that blow out to white-ish
  whiteOut?: number; // last N frames wash out to white
};

export type CompositeScene = {
  type: "composite";
  duration: number;
  clips: Record<string, CompClip>;
  cutouts?: Record<string, CompCutout>;
  shots: CompShot[];
  mono?: boolean; // black and white
  film?: { grain?: number; vignette?: number; haze?: number; lift?: number };
};
