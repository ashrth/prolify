import type React from "react";
import { Easing, interpolate, spring } from "remotion";
import { clamp } from "./layout";
import type { EnterPreset } from "./types";

export const PRESETS: EnterPreset[] = ["slam", "rise", "mask-up", "blur-in", "pop", "fade"];

// Fast start, long soft landing. The "expensive" feeling easing.
export const outExpo = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * Returns the CSS for an entering element.
 * `frame` is relative to when the animation starts (negative = not started yet).
 * To add a new preset: add its name to EnterPreset in types.ts, then a case here.
 */
export const enterStyle = (
  preset: EnterPreset,
  frame: number,
  fps: number,
  u: number,
): React.CSSProperties => {
  if (preset === "none") return {};
  if (frame < 0) return preset === "mask-up" ? { transform: "translateY(110%)" } : { opacity: 0 };

  switch (preset) {
    case "slam": {
      const s = spring({ frame, fps, config: { damping: 15, stiffness: 260, mass: 0.7 } });
      return {
        opacity: interpolate(frame, [0, 2], [0, 1], clamp),
        transform: `scale(${interpolate(s, [0, 1], [1.7, 1])})`,
        filter: `blur(${interpolate(s, [0, 1], [14, 0]) * u}px)`,
      };
    }
    case "rise": {
      const p = interpolate(frame, [0, 20], [0, 1], { ...clamp, easing: outExpo });
      return { opacity: p, transform: `translateY(${(1 - p) * 70 * u}px)` };
    }
    case "mask-up": {
      const p = interpolate(frame, [0, 16], [0, 1], { ...clamp, easing: outExpo });
      return { transform: `translateY(${(1 - p) * 110}%)` };
    }
    case "blur-in": {
      const p = interpolate(frame, [0, 22], [0, 1], { ...clamp, easing: outExpo });
      return {
        opacity: p,
        filter: `blur(${(1 - p) * 24 * u}px)`,
        transform: `scale(${1.08 - 0.08 * p})`,
      };
    }
    case "pop": {
      const s = spring({ frame, fps, config: { damping: 9, stiffness: 180, mass: 0.6 } });
      return { opacity: interpolate(frame, [0, 3], [0, 1], clamp), transform: `scale(${s})` };
    }
    case "fade":
      return { opacity: interpolate(frame, [0, 12], [0, 1], clamp) };
  }
};
