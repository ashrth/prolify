import type { VideoScript } from "../../../core/types";
import { x657oBrand } from "../brand";

const A = "x657o/ascii";
const sfx = (name: string) => `sounds/${name}.mp3`;
const FACE = "75% 50%"; // keeps her face in frame when the square images fill the vertical screen

const img = {
  original: `${A}/original.jpg`,
  dense: `${A}/dense.jpg`,
  classic: `${A}/classic-blue.jpg`,
  blocks: `${A}/blocks.jpg`,
  binary: `${A}/binary.jpg`,
  behind: `${A}/image-behind.jpg`,
};

const CUT = 12; // frames per character set in the "characters" scene

// 30 frames = 1 second. Total ≈ 10.4s. Lowercase to match the app's ascii panel.
export const x657oAscii: VideoScript = {
  brand: x657oBrand,
  music: { src: sfx("music"), volume: 0.4 },
  scenes: [
    {
      // 0:00 — hook: a scan line turns the photo into ascii
      type: "scan-reveal",
      duration: 50,
      before: img.original,
      after: img.classic,
      scanFrom: 4,
      scanTo: 24,
      objectPosition: FACE,
      headline: "ascii art",
      sub: "new on x657o",
      sounds: [
        { src: sfx("whoosh"), at: 4 },
        { src: sfx("impact"), at: 26 },
      ],
    },
    {
      // 0:01.7 — character sets, one click each
      type: "effect-showcase",
      duration: 4 * CUT + 6,
      headline: "pick your characters",
      aspect: 1,
      imageWidth: 760,
      images: [
        { at: 0, image: img.dense },
        { at: CUT, image: img.classic },
        { at: 2 * CUT, image: img.blocks },
        { at: 3 * CUT, image: img.binary },
      ],
      panel: [
        { kind: "title", text: "ascii art" },
        {
          kind: "pills",
          label: "characters",
          columns: 3,
          options: ["dense", "classic", "blocks", "binary", "letters", "custom"],
          select: [0, 1, 2, 3].map((i) => ({ at: i * CUT, index: i })),
        },
      ],
      sounds: [1, 2, 3].map((i) => ({ src: sfx("click"), at: i * CUT })),
    },
    {
      // 0:03.5 — color: original, single color, background + image behind
      type: "effect-showcase",
      duration: 48,
      headline: "any color",
      aspect: 1,
      imageWidth: 760,
      images: [
        { at: 0, image: img.dense },
        { at: 14, image: img.classic },
        { at: 28, image: img.behind },
      ],
      panel: [
        { kind: "title", text: "ascii art" },
        {
          kind: "pills",
          label: "color",
          options: ["original", "single color"],
          select: [
            { at: 0, index: 0 },
            { at: 14, index: 1 },
          ],
        },
        {
          kind: "swatch",
          label: "color",
          showAt: 14,
          colors: [
            { at: 14, color: "#3F8EF5" },
            { at: 28, color: "#E8C9C9" },
          ],
        },
        { kind: "swatch", label: "background", showAt: 28, colors: [{ at: 28, color: "#3F0D0D" }] },
      ],
      sounds: [
        { src: sfx("click"), at: 14 },
        { src: sfx("click"), at: 28 },
        { src: sfx("pop"), at: 30, volume: 0.6 },
      ],
    },
    {
      // 0:05.1 — every control, sliders sweeping to the real settings
      type: "effect-showcase",
      duration: 54,
      headline: "fine-tune everything",
      aspect: 1,
      imageWidth: 600,
      images: [{ at: 0, image: img.behind }],
      panel: [
        { kind: "title", text: "ascii art" },
        { kind: "slider", slider: { label: "detail", from: 80, to: 225, min: 20, max: 300, start: 4, end: 16 } },
        { kind: "slider", slider: { label: "contrast", from: 100, to: 172, max: 300, suffix: "%", start: 10, end: 22 } },
        { kind: "slider", slider: { label: "brightness", from: 0, to: 35, min: -50, max: 50, start: 16, end: 28 } },
        { kind: "slider", slider: { label: "color boost", from: 100, to: 131, min: 100, max: 250, suffix: "%", start: 22, end: 34 } },
        { kind: "slider", slider: { label: "image behind", from: 0, to: 43, max: 100, suffix: "%", start: 28, end: 40 } },
      ],
      sounds: [{ src: sfx("slider"), at: 4, duration: 36 }],
    },
    {
      // 0:06.9 — recap: every look, full screen
      type: "flash-cuts",
      duration: 40,
      framesPer: 8,
      objectPosition: FACE,
      items: [
        { image: img.dense, label: "dense" },
        { image: img.classic, label: "classic" },
        { image: img.blocks, label: "blocks" },
        { image: img.binary, label: "binary" },
        { image: img.behind, label: "image behind" },
      ],
      sounds: [0, 8, 16, 24, 32].map((at) => ({ src: sfx("pop"), at, volume: 0.7 })),
    },
    {
      // 0:08.3 — CTA
      type: "cta",
      duration: 70,
      wordmark: "x657o",
      button: "try ascii art",
      url: "x657o.vercel.app",
      sounds: [
        { src: sfx("whoosh"), at: 0 },
        { src: sfx("pop"), at: 36 },
      ],
    },
  ],
};
