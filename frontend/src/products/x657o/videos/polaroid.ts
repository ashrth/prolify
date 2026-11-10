import type { VideoScript } from "../../../core/types";
import { x657oBrand } from "../brand";

const P = "x657o/polaroid";
const sfx = (name: string) => `sounds/${name}.mp3`;
const img = {
  full: `${P}/original-full.jpg`, // the whole original photo
  original: `${P}/original.jpg`, // square crop, no effect (lines up exactly with result.jpg)
  result: `${P}/result.jpg`, // the app's real export, default settings
};

// 30 frames = 1 second. Total ≈ 12.8s. Lowercase to match the app.
export const x657oPolaroid: VideoScript = {
  brand: x657oBrand,
  music: { src: sfx("music"), volume: 0.4 },
  scenes: [
    {
      // 0:00 — the original, a camera flash, the polaroid drops in and develops
      type: "polaroid",
      mode: "hook",
      duration: 60,
      original: img.full,
      photo: img.result,
      caption: "26.08.99",
      headline: "polaroid",
      kicker: "new on x657o",
      flashAt: 12,
      sounds: [
        { src: sfx("impact"), at: 12 }, // swap for a camera shutter sound if you have one
        { src: sfx("pop"), at: 26, volume: 0.8 },
        ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ src: sfx("tick"), at: 34 + Math.round(i * 1.5), volume: 0.35 })),
      ],
    },
    {
      // 0:02 — the film controls, the photo reacting live
      type: "polaroid",
      mode: "tune",
      duration: 54,
      headline: "fine-tune the film",
      original: img.original,
      photo: img.result,
      sliders: [
        { param: "intensity", label: "intensity", from: 0, to: 100, start: 4, end: 16 },
        { param: "fade", label: "fade", from: 100, to: 50, start: 14, end: 26 },
        { param: "warmth", label: "warmth", from: 100, to: 50, start: 24, end: 36 },
        { param: "shadowTint", label: "shadow tint", from: 100, to: 50, start: 32, end: 44 },
      ],
      sounds: [{ src: sfx("slider"), at: 4, duration: 40 }],
    },
    {
      // 0:03.8 — the details, ending on the app's real export
      type: "polaroid",
      mode: "tune",
      duration: 54,
      headline: "grain, glow & leaks",
      original: img.original,
      photo: img.result,
      cardEnter: false, // the card stays put from the previous scene
      sliders: [
        { param: "softness", label: "softness", from: 100, to: 30, start: 4, end: 16 },
        { param: "grain", label: "grain", from: 100, to: 30, start: 14, end: 26 },
        { param: "vignette", label: "vignette", from: 100, to: 40, start: 24, end: 36 },
        { param: "lightLeak", label: "light leak", from: 100, to: 20, start: 32, end: 44 },
      ],
      revealAt: 44,
      sounds: [{ src: sfx("slider"), at: 4, duration: 40 }],
    },
    {
      // 0:05.6 — frame colors
      type: "polaroid",
      mode: "frames",
      duration: 42,
      headline: "pick your frame",
      photo: img.result,
      caption: "26.08.99",
      changes: [
        { at: 0, frame: "cream" },
        { at: 14, frame: "white" },
        { at: 28, frame: "black" },
      ],
      sounds: [
        { src: sfx("click"), at: 14 },
        { src: sfx("click"), at: 28 },
      ],
    },
    {
      // 0:07 — the caption gets written, then the font changes
      type: "polaroid",
      mode: "caption",
      duration: 54,
      headline: "write your caption",
      photo: img.result,
      text: "last summer",
      typeFrom: 6,
      perChar: 2,
      fonts: [
        { at: 0, font: "marker" },
        { at: 32, font: "caveat" },
        { at: 44, font: "shadows" },
      ],
      sounds: [
        ...Array.from({ length: 11 }, (_, i) => ({ src: sfx("tick"), at: 6 + i * 2, volume: 0.35 })),
        { src: sfx("click"), at: 32 },
        { src: sfx("click"), at: 44 },
      ],
    },
    {
      // 0:08.8 — a pile of polaroids, one look each, the real export landing on top
      type: "polaroid",
      mode: "pile",
      duration: 54,
      headline: "make it yours.",
      original: img.original,
      cards: [
        { at: 0, x: -190, y: -420, rot: -9, width: 470, frame: "cream", caption: "golden hour", font: "caveat",
          look: { fade: 60, warmth: 90, shadowTint: 30, softness: 40, grain: 40, vignette: 50, lightLeak: 65 } },
        { at: 8, x: 200, y: -330, rot: 7, width: 470, frame: "white", caption: "3am", font: "marker", zoom: 1.5, position: "75% 15%",
          look: { fade: 40, warmth: 25, shadowTint: 85, softness: 20, grain: 35, vignette: 55, lightLeak: 0 } },
        { at: 16, x: -210, y: 150, rot: 5, width: 470, frame: "black", caption: "1999", font: "shadows", zoom: 1.4, position: "70% 65%",
          look: { fade: 85, warmth: 60, shadowTint: 45, softness: 55, grain: 90, vignette: 30, lightLeak: 10 } },
        { at: 24, x: 210, y: 230, rot: -6, width: 470, frame: "cream", caption: "us", font: "caveat", zoom: 1.2, position: "30% 80%",
          look: { fade: 55, warmth: 65, shadowTint: 60, softness: 85, grain: 20, vignette: 75, lightLeak: 45 } },
        { at: 32, x: 0, y: 20, rot: -2, width: 600, frame: "cream", caption: "26.08.99", font: "marker", real: img.result },
      ],
      sounds: [
        ...[0, 8, 16, 24].map((at) => ({ src: sfx("pop"), at, volume: 0.7 })),
        { src: sfx("impact"), at: 32 },
      ],
    },
    {
      // 0:10.6 — CTA
      type: "cta",
      duration: 66,
      wordmark: "x657o",
      button: "try polaroid",
      url: "x657o.com",
      sounds: [
        { src: sfx("whoosh"), at: 0 },
        { src: sfx("pop"), at: 36 },
      ],
    },
  ],
};
