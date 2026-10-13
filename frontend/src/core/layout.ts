import { useVideoConfig } from "remotion";

/**
 * `u` is a size unit: 1 at 1080px on the short side.
 * Write every size as `N * u` and the same scene works at
 * 1920x1080 (landscape) and 1080x1920 (vertical).
 */
export const useLayout = () => {
  const { width, height, fps } = useVideoConfig();
  const isVertical = height > width;
  const u = Math.min(width, height) / 1080;
  return { width, height, fps, isVertical, u };
};

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** "#2400FF" + 0.4 → "rgba(36,0,255,0.4)" */
export const withAlpha = (hex: string, alpha: number) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};
