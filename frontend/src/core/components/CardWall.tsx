import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { clamp, useLayout } from "../layout";
import { outExpo } from "../presets";

/**
 * A wall of tilted cards floating in 3D, drifting slowly upward.
 * Pure CSS 3D transforms (no WebGL), so it renders fast.
 * `random(seed)` from Remotion is deterministic: same layout every render.
 */
export const CardWall: React.FC<{ images: string[]; seed?: string }> = ({ images, seed = "wall" }) => {
  const frame = useCurrentFrame();
  const { u, isVertical } = useLayout();

  const cols = isVertical ? 4 : 7;
  const rows = isVertical ? 6 : 4;
  const cardW = 300 * u;
  const cardH = 380 * u;
  const gapX = 390 * u;
  const gapY = 470 * u;

  const cards = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const rnd = (k: string) => random(`${seed}-${k}-${i}`);
      const depth = rnd("z");
      const x = (c - (cols - 1) / 2) * gapX + (rnd("x") - 0.5) * 90 * u;
      const y = (r - (rows - 1) / 2) * gapY + (c % 2 ? 0.25 : -0.25) * gapY + (rnd("y") - 0.5) * 60 * u;
      const z = -depth * 700 * u;
      const float = Math.sin(frame / 28 + i) * 12 * u;
      const appear = interpolate(frame, [i * 0.8, i * 0.8 + 16], [0, 1], { ...clamp, easing: outExpo });

      cards.push(
        <div
          key={i}
          style={{
            position: "absolute",
            width: cardW,
            height: cardH,
            left: -cardW / 2,
            top: -cardH / 2,
            borderRadius: 24 * u,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            opacity: appear * (0.45 + 0.55 * (1 - depth)),
            transform: [
              `translate3d(${x}px, ${y + float}px, ${z}px)`,
              `rotateX(${(rnd("rx") - 0.5) * 24}deg)`,
              `rotateY(${(rnd("ry") - 0.5) * 50}deg)`,
              `rotateZ(${(rnd("rz") - 0.5) * 14}deg)`,
              `scale(${0.85 + 0.15 * appear})`,
            ].join(" "),
          }}
        >
          <Img
            src={staticFile(images[i % images.length])}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>,
      );
    }
  }

  return (
    <AbsoluteFill style={{ perspective: 1800 * u, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transformStyle: "preserve-3d",
          transform: `rotateX(10deg) rotateY(${-6 + frame * 0.04}deg) translateY(${-frame * 1.2 * u}px)`,
        }}
      >
        {cards}
      </div>
    </AbsoluteFill>
  );
};
