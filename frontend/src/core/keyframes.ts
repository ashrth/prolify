import { Easing, interpolate } from "remotion";

/** A value that can change over time: a fixed number, or keyframes as [frame, value] pairs (in order). */
export type Keyframed = number | [number, number][];

/** The value at `frame`, easing smoothly between keyframes and holding before the first and after the last. */
export const valueAt = (k: Keyframed, frame: number): number => {
  if (typeof k === "number") return k;
  if (k.length === 0) return 0;
  if (k.length === 1) return k[0][1];
  return interpolate(
    frame,
    k.map(([f]) => f),
    k.map(([, v]) => v),
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );
};

/** The adjustments of Remotion's colorCorrection() effect, each one fixed or keyframed. */
export type ColorFx = Partial<
  Record<
    | "exposure"
    | "contrast"
    | "shadows"
    | "highlights"
    | "whites"
    | "blacks"
    | "temperature"
    | "tint",
    Keyframed
  >
>;

/** Every adjustment's value at `frame`, ready for colorCorrection(). */
export const colorFxAt = (fx: ColorFx, frame: number) =>
  Object.fromEntries(
    Object.entries(fx).map(([key, k]) => [key, valueAt(k as Keyframed, frame)]),
  );
