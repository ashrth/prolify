import type { VideoScript } from "../../../core/types";
import { x657oBrand } from "../brand";

const P = "x657o/pro";
const sfx = (name: string) => `sounds/${name}.mp3`;

const CLICK_AT = 62; // when the cursor picks "lifetime" in the pricing scene

// 30 frames = 1 second. Total ≈ 11.9s. Lowercase to match the app's "go pro" modal.
export const x657oGoPro: VideoScript = {
  brand: x657oBrand,
  music: { src: sfx("music"), volume: 0.4 },
  scenes: [
    {
      // 0:00 — hook: the prices cut fast, lifetime slams in
      type: "swap-hook",
      duration: 50,
      framesPer: 7,
      lines: [
        { main: "$5", small: "/month" },
        { main: "$40", small: "/year" },
        { main: "$29", small: "once." },
      ],
      sub: "lifetime · first 30 only",
      sounds: [
        { src: sfx("tick"), at: 0 },
        { src: sfx("tick"), at: 7 },
        { src: sfx("impact"), at: 14 },
        { src: sfx("cash"), at: 16, volume: 0.8 },
      ],
    },
    {
      // 0:01.7 — all effects: rapid cuts
      type: "feature",
      duration: 36,
      headline: "all effects",
      visual: {
        kind: "flip",
        framesPer: 4,
        images: [
          "x657o/effects/ascii.png",
          "x657o/motion-blur/spin.jpg",
          "x657o/effects/light-ray.png",
          "x657o/effects/binary.png",
          "x657o/motion-blur/zoom.jpg",
          "x657o/effects/hollywood.png",
          "x657o/effects/flash.png",
          "x657o/motion-blur/linear.jpg",
          "x657o/effects/circle.png",
        ],
      },
      sounds: [0, 8, 16, 24].map((at) => ({ src: sfx("tick"), at, volume: 0.5 })),
    },
    {
      // 0:02.9 — all templates
      type: "feature",
      duration: 30,
      headline: "all templates",
      visual: { kind: "image", image: "x657o/templates.png", aspect: 1146 / 1360 },
      sounds: [{ src: sfx("whoosh"), at: 0 }],
    },
    {
      // 0:03.9 — no watermark: zoomed on the watermark, crossed out, gone, pull back
      type: "feature",
      duration: 44,
      headline: "no watermark",
      visual: { kind: "watermark", image: `${P}/street-clean.jpg`, aspect: 1, text: "made with x657o", strikeAt: 10, removeAt: 18 },
      sounds: [
        { src: sfx("swipe"), at: 10 },
        { src: sfx("whoosh"), at: 20, volume: 0.7 },
      ],
    },
    {
      // 0:05.4 — 4k export: pixelated → sharp
      type: "feature",
      duration: 38,
      headline: "4k export",
      visual: {
        kind: "steps",
        framesPer: 7,
        aspect: 2 / 3,
        steps: [
          { image: `${P}/4k-360p.png`, label: "360p" },
          { image: `${P}/4k-720p.png`, label: "720p" },
          { image: `${P}/4k-1080p.png`, label: "1080p" },
          { image: `${P}/4k-full.jpg`, label: "4k" },
        ],
      },
      sounds: [
        { src: sfx("tick"), at: 0 },
        { src: sfx("tick"), at: 7 },
        { src: sfx("tick"), at: 14 },
        { src: sfx("impact"), at: 21 },
      ],
    },
    {
      // 0:06.6 — the real pricing, cursor picks lifetime
      type: "pricing",
      duration: 90,
      title: "go pro",
      subtitle: "all effects · all templates · no watermark · 4k export",
      plans: [
        { name: "monthly", price: "$5", suffix: "/month" },
        { name: "yearly", price: "$40", suffix: "/year", badge: "save 33%" },
        { name: "lifetime", price: "$29", suffix: "once", badge: "early supporter" },
      ],
      button: "choose",
      pick: 2,
      clickAt: CLICK_AT,
      note: "first 30 only.",
      sounds: [
        { src: sfx("pop"), at: 10, volume: 0.7 },
        { src: sfx("pop"), at: 15, volume: 0.7 },
        { src: sfx("pop"), at: 20, volume: 0.7 },
        { src: sfx("ui-click"), at: CLICK_AT },
        { src: sfx("cash"), at: CLICK_AT + 2, volume: 0.8 },
      ],
    },
    {
      // 0:09.6 — CTA
      type: "cta",
      duration: 70,
      wordmark: "x657o",
      button: "go pro today",
      url: "x657o.vercel.app",
      sounds: [
        { src: sfx("whoosh"), at: 0 },
        { src: sfx("pop"), at: 36 },
      ],
    },
  ],
};
