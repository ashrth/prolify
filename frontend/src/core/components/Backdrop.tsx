import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useLayout, withAlpha } from "../layout";
import type { Brand } from "../types";

/** Base background: brand color, optional accent glow, soft vignette. */
export const Backdrop: React.FC<{ brand: Brand; glow?: number }> = ({ brand, glow = 0 }) => (
  <AbsoluteFill style={{ background: brand.colors.bg }}>
    {glow > 0 ? (
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 45%, ${withAlpha(brand.colors.accent, 0.4 * glow)} 0%, transparent 45%)`,
        }}
      />
    ) : null}
    <AbsoluteFill
      style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.65) 100%)" }}
    />
  </AbsoluteFill>
);

/** Slow-moving gray blobs: a dark "liquid chrome" field behind text. */
export const ChromeField: React.FC = () => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const blobs = [
    { x: 30, y: 35, size: 1100, speed: 0.021, tone: 0.16 },
    { x: 70, y: 60, size: 1300, speed: 0.017, tone: 0.12 },
    { x: 50, y: 85, size: 900, speed: 0.025, tone: 0.1 },
  ];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {blobs.map((b, i) => {
        const dx = Math.sin(frame * b.speed + i * 2) * 8;
        const dy = Math.cos(frame * b.speed * 0.8 + i) * 6;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${b.x + dx}%`,
              top: `${b.y + dy}%`,
              width: b.size * u,
              height: b.size * u,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(210,210,220,${b.tone}) 0%, transparent 62%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
