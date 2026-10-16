import type { PanelSlider, VideoScript } from "../../../core/types";
import { x657oBrand } from "../brand";

const MB = "x657o/motion-blur";
const sfx = (name: string) => `sounds/${name}.mp3`;

// Your real settings from the app
const STRENGTH = 53;
const INTENSITY = 86;
const CENTER = { x: 78, y: 44 };
const MODES = ["Linear", "Zoom", "Spin"];

// How big each blur looks at Strength 53%, matched against the app's real output
const FULL = { linear: 0.14, zoom: 0.3, spin: 22 };

const strength = (start: number, end: number): PanelSlider => ({
  label: "Strength",
  from: 0,
  to: STRENGTH,
  max: 100,
  suffix: "%",
  start,
  end,
  drives: "amount",
});
const intensity: PanelSlider = {
  label: "Intensity",
  from: INTENSITY,
  to: INTENSITY,
  max: 100,
  suffix: "%",
};

// 30 frames = 1 second. Total ≈ 12.4s.
export const x657oMotionBlur: VideoScript = {
  brand: x657oBrand,
  music: { src: sfx("music"), volume: 0.4 },
  scenes: [
    {
      // 0:00 — hook on the finished result
      type: "image-title",
      duration: 45,
      image: `${MB}/spin.jpg`,
      kicker: "NEW ON X657O",
      headline: "MOTION BLUR.",
      sub: "LINEAR. ZOOM. SPIN.",
      sounds: [{ src: sfx("impact"), at: 4 }],
    },
    {
      // 0:01.5 — Linear: drag Strength, the photo smears sideways
      type: "effect-demo",
      duration: 55,
      title: "LINEAR",
      font: "instrument",
      panelTitle: "MOTION BLUR",
      modes: MODES,
      activeMode: 0,
      clickAt: 2,
      image: `${MB}/original.jpg`,
      result: `${MB}/linear.jpg`,
      aspect: 2 / 3,
      blur: { kind: "linear", full: FULL.linear, angle: 0 },
      sliders: [
        strength(8, 40),
        intensity,
        { label: "Angle", from: 0, to: 0, max: 360, suffix: "°" },
      ],
      revealAt: 42,
      sounds: [
        { src: sfx("ui-click"), at: 2 },
        { src: sfx("slider"), at: 8, duration: 32 },
      ],
    },
    {
      // Zoom: 60 frames
      type: "effect-demo",
      duration: 60,
      title: "ZOOM",
      font: "instrument",
      panelTitle: "MOTION BLUR",
      modes: MODES,
      activeMode: 1,
      previousMode: 0,
      clickAt: 4,
      image: `${MB}/original.jpg`,
      result: `${MB}/zoom.jpg`,
      aspect: 2 / 3,
      blur: { kind: "zoom", full: FULL.zoom },
      sliders: [
        strength(22, 42),
        intensity,
        {
          label: "Center X",
          from: 50,
          to: CENTER.x,
          max: 100,
          suffix: "%",
          start: 6,
          end: 20,
          drives: "centerX",
        },
        {
          label: "Center Y",
          from: 50,
          to: CENTER.y,
          max: 100,
          suffix: "%",
          start: 6,
          end: 20,
          drives: "centerY",
        },
      ],
      revealAt: 46,
      sounds: [
        { src: sfx("ui-click"), at: 4 },
        { src: sfx("slider"), at: 6, duration: 14 },
        { src: sfx("slider"), at: 22, duration: 20 },
      ],
    },
    {
      // Spin: 45 frames
      type: "effect-demo",
      duration: 45,
      title: "SPIN",
      font: "instrument",
      panelTitle: "MOTION BLUR",
      modes: MODES,
      activeMode: 2,
      previousMode: 1,
      clickAt: 2,
      image: `${MB}/original.jpg`,
      result: `${MB}/spin.jpg`,
      aspect: 2 / 3,
      blur: { kind: "spin", full: FULL.spin },
      sliders: [
        strength(4, 26),
        intensity,
        {
          label: "Center X",
          from: CENTER.x,
          to: CENTER.x,
          max: 100,
          suffix: "%",
          drives: "centerX",
        },
        {
          label: "Center Y",
          from: CENTER.y,
          to: CENTER.y,
          max: 100,
          suffix: "%",
          drives: "centerY",
        },
      ],
      revealAt: 30,
      sounds: [
        { src: sfx("click"), at: 2 },
        { src: sfx("slider"), at: 4, duration: 22 },
      ],
    },
    {
      // 0:08.9 — recap: all three, hard cuts
      type: "flash-cuts",
      duration: 30,
      framesPer: 10,
      items: [
        { image: `${MB}/linear.jpg`, label: "LINEAR" },
        { image: `${MB}/zoom.jpg`, label: "ZOOM" },
        { image: `${MB}/spin.jpg`, label: "SPIN" },
      ],
      sounds: [0, 10, 20].map((at) => ({ src: sfx("casette"), at })),
    },
    {
      // 0:09.9 — CTA
      type: "cta",
      duration: 75,
      button: "TRY IT FREE",
      url: "x657o.vercel.app",
      sounds: [
        { src: sfx("whoosh"), at: 0 },
        { src: sfx("game-click"), at: 36 },
      ],
    },
  ],
};
