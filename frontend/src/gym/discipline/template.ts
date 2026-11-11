import type { FootageClip, Shot, VideoScript } from "../../core/types";

// ─────────────────────────────────────────────────────────────
// DISCIPLINE template: the layout, timing and music sync live here.
// Don't edit this to make a new version; make a new content file instead (see back.ts).
// ─────────────────────────────────────────────────────────────

/** A clip and a list of good starting seconds in it. Each moment needs ~1.2s of clip after it. */
export type Move = FootageClip & { moments: number[] };

export type DisciplineContent = {
  word: string; // the big word in the opening
  music: string; // path in /public
  hero: FootageClip & {
    at: number; // the opening uses 3.4s of this clip from here
    scale?: number; // zoom in…
    shiftX?: number; // …and move sideways (%) so her body covers the end of the word
    cutout?: { folder: string; count: number }; // made from the same 3.4s (see tools/cutout.sh)
  };
  flex: FootageClip & { moments: [number, number, number, number] }; // push-in, quick cut, big hit, ending (the ending needs 1.3s)
  moves: [Move, Move, Move, Move, Move]; // five exercise clips
};

// Which clip each shot uses: one of the 5 moves (0–4) or "flex", and which of its moments.
type Slot = { role: number | "flex"; n: number };

// The 22 shots after the drop, timed to the track's hits. Frames: 30 = 1s.
const LAYOUT: (Slot & Omit<Shot, "clip" | "at" | "split"> & { split?: Slot })[] = [
  { role: 3, n: 0, frames: 11, white: [0, 2] },
  { role: 0, n: 0, frames: 22, punch: true },
  { role: 1, n: 0, frames: 11 },
  { role: 2, n: 0, frames: 10 },
  { role: 4, n: 0, frames: 22, punch: true, enter: "diagonal", split: { role: 1, n: 5 } },
  { role: "flex", n: 0, frames: 22, push: true },
  { role: 3, n: 1, frames: 11, punch: true },
  { role: 4, n: 1, frames: 22 },
  { role: 0, n: 1, frames: 11 },
  { role: 1, n: 1, frames: 18, punch: true, enter: "shrink" },
  { role: 2, n: 1, frames: 20, whip: true },
  { role: 1, n: 2, frames: 5, white: [0, 5] },
  { role: 1, n: 3, frames: 33, punch: true },
  { role: 4, n: 2, frames: 11, enter: "slices" },
  { role: 3, n: 2, frames: 22, punch: true },
  { role: "flex", n: 1, frames: 11 },
  { role: 0, n: 2, frames: 5 },
  { role: 2, n: 2, frames: 6 },
  { role: "flex", n: 2, frames: 11, punch: true },
  { role: 1, n: 4, frames: 11 },
  { role: 4, n: 3, frames: 11, enter: "letterbox" },
  { role: "flex", n: 3, frames: 37, glitch: [7, 21], blurOut: 11 },
];

const INTRO = 101; // frames of the opening, until the drop

export const disciplineTemplate = (c: DisciplineContent): VideoScript => {
  // every clip gets a key the scenes can refer to
  const clips: Record<string, FootageClip> = { hero: c.hero, flex: c.flex };
  c.moves.forEach((m, i) => (clips[`move${i}`] = m));

  const key = (s: Slot) => (s.role === "flex" ? "flex" : `move${s.role}`);
  const at = (s: Slot) => {
    const list = s.role === "flex" ? c.flex.moments : c.moves[s.role].moments;
    return list[s.n % list.length]; // fewer moments than needed? it cycles through the ones you gave
  };

  const shots: Shot[] = LAYOUT.map(({ role, n, split, ...rest }) => ({
    ...rest,
    clip: key({ role, n }),
    at: at({ role, n }),
    ...(split ? { split: { clip: key(split), at: at(split) } } : {}),
  }));

  // 17 flashes inside the opening band: cycle through the five moves
  const flashes = Array.from({ length: 17 }, (_, i) => {
    const role = [4, 0, 1, 2, 3][i % 5];
    const m = c.moves[role].moments;
    return { clip: `move${role}`, at: m[Math.floor(i / 5) % m.length] + 0.3 };
  });

  return {
    brand: {
      name: "gym",
      logo: "",
      url: "",
      colors: { bg: "#000000", panel: "#000000", text: "#FFFFFF", textMuted: "rgba(255,255,255,0.6)", accent: "#E8261A", chrome: ["#555", "#eee", "#888", "#ddd"] },
    },
    music: { src: c.music, volume: 1, fade: false },
    scenes: [
      {
        type: "text-behind",
        duration: INTRO,
        clips,
        base: { clip: "hero", at: c.hero.at, scale: c.hero.scale ?? 1.3, shiftX: c.hero.shiftX ?? 10 },
        text: c.word,
        color: "#E8261A",
        textSize: 300,
        band: { centerY: 0.55, openAt: 16, heights: [190, 330], growAt: 58, hideAt: 88 },
        flashFrom: 36,
        flashEvery: 3,
        flashes,
        silhouetteAt: 95,
        ...(c.hero.cutout ? { cutout: c.hero.cutout } : {}),
      },
      { type: "footage-cuts", duration: shots.reduce((t, s) => t + s.frames, 0), clips, shots },
    ],
  };
};
