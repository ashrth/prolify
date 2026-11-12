import { blur } from "@remotion/effects/blur";
import { duotone } from "@remotion/effects/duotone";
import { pixelate } from "@remotion/effects/pixelate";

// The effects a project can use by name. To add one: import it and add it here,
// then use its name as "type" in a project's effects list.
const EFFECTS: Record<string, (params: any) => any> = {
  duotone, // darkColor, lightColor, threshold
  pixelate, // blockSize
  blur, // radius
};

/** An effect switched on between two frames of the video, with its settings. Plain data, so it can live in a project's JSON. */
export type TimedEffect = { type: string; from: number; to: number; [setting: string]: unknown };

/** Turns a project's effect entry into the real effect. */
export const makeEffect = ({ type, from: _from, to: _to, ...settings }: TimedEffect) => {
  const make = EFFECTS[type];
  if (!make) throw new Error(`Unknown effect "${type}". Known: ${Object.keys(EFFECTS).join(", ")}`);
  return make(settings);
};

/**
 * Puts a project's effects onto the shots they overlap, converting video frames into each shot's own frames.
 * `firstFrame` is where the shots start in the video.
 */
export const applyProjectEffects = <S extends { frames: number; timed?: { from: number; to: number; effect: any }[] }>(
  shots: S[],
  effects: TimedEffect[] | undefined,
  firstFrame: number,
) => {
  if (!effects?.length) return shots;
  let start = firstFrame;
  return shots.map((shot) => {
    const shotStart = start;
    start += shot.frames;
    const timed = [...(shot.timed ?? [])];
    for (const e of effects) {
      const from = Math.max(e.from, shotStart) - shotStart;
      const to = Math.min(e.to, shotStart + shot.frames - 1) - shotStart;
      if (from <= to) timed.push({ from, to, effect: makeEffect(e) });
    }
    return timed.length ? { ...shot, timed } : shot;
  });
};