import type { VideoScript } from "../../../core/types";
import { x657oBrand } from "../brand";

// Asset paths are relative to /public.
const card = (file: string) => `x657o/cards/${file}.png`; // with the effect label baked in
const effect = (name: string, file: string) => ({
  name,
  image: `x657o/effects/${file}.png`,
});
const FLIP = 14; // frames each effect card stays on screen

// 30 frames = 1 second. Total ≈ 26.7s.
export const x657oLaunch: VideoScript = {
  brand: x657oBrand,
  music: { src: "sounds/music.mp3", volume: 0.4 },
  scenes: [
    {
      // 0:00 — open on the payoff: the card wall from the site + the tagline
      type: "hook",
      duration: 100,
      lines: ["ONE CLICK.", "FINISHED POST."],
      cards: [
        "ascii",
        "binary",
        "light-ray",
        "hollywood",
        "flash",
        "circle",
      ].map(card),
    },
    {
      // 0:03 — the problem, crossed out
      type: "strike-list",
      duration: 90,
      items: ["NO TIMELINE.", "NO KEYFRAMES.", "NO EDITING SOFTWARE."],
      sounds: [
        { src: "sounds/whoosh.mp3", at: 6 }, // "NO TIMELINE." slams
        { src: "sounds/whoosh.mp3", at: 26 }, // "NO KEYFRAMES." slams
        { src: "sounds/whoosh.mp3", at: 46 }, // "NO EDITING SOFTWARE." slams
      ],
    },
    {
      // 0:06 — the showreel moment: hard cuts through the effects
      type: "effect-flip",
      duration: 168,
      framesPerEffect: FLIP,
      effects: [
        effect("ASCII", "ascii"),
        effect("BINARY", "binary"),
        effect("LIGHT RAY", "light-ray"),
        effect("HOLLYWOOD", "hollywood"),
        effect("FLASH", "flash"),
        effect("CIRCLE", "circle"),
      ],
      outro: "AND MORE.",
      sounds: [0, 1, 2, 3, 4, 5].map((i) => ({
        src: "sounds/pop.mp3",
        at: i * FLIP,
      })),
    },
    {
      // 0:11 — the real app in a browser, cursor clicks "Image editor"
      type: "browser-demo",
      duration: 130,
      screenshot: "x657o/hero.png",
      aspect: 2560 / 1430,
      url: "x657o.vercel.app",
      caption: ["RUNS IN YOUR BROWSER.", "NOTHING TO INSTALL."],
      click: { x: 0.352, y: 0.742, atFrame: 72 },
      sounds: [{ src: "sounds/click.mp3", at: 72 }],
    },
    {
      // 0:16 — templates
      type: "steps",
      duration: 110,
      steps: ["PICK A TEMPLATE.", "SWAP YOUR IMAGE.", "EXPORT."],
      image: "x657o/templates.png",
      aspect: 1146 / 1360,
    },
    {
      // 0:19 — the shop
      type: "statement",
      duration: 84,
      kicker: "ALSO IN THE SHOP",
      headline: "DAVINCI RESOLVE",
      sub: "TEMPLATES AND EFFECTS",
    },
    {
      // 0:22 — logo + CTA
      type: "cta",
      duration: 120,
      button: "TRY IT FREE",
      url: "x657o.vercel.app",
      sounds: [{ src: "sounds/impact.mp3", at: 40 }],
    },
  ],
};
