import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { clamp, useLayout } from "../layout";
import { outExpo } from "../presets";
import type { Brand, FlashCutsScene as CutsData } from "../types";

/** Full-bleed hard cuts with a punch-zoom and white flash on each, label in the middle. */
export const FlashCutsScene: React.FC<{ data: CutsData; brand: Brand }> = ({ data, brand }) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const idx = Math.min(Math.floor(frame / data.framesPer), data.items.length - 1);
  const local = frame - idx * data.framesPer;
  const item = data.items[idx];

  const punch = interpolate(local, [0, 8], [1.12, 1.02], { ...clamp, easing: outExpo });
  const flash = interpolate(local, [0, 4], [0.35, 0], clamp);

  return (
    <AbsoluteFill style={{ background: brand.colors.bg }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <Img src={staticFile(item.image)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: data.objectPosition ?? "50% 50%" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.25)" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <AnimatedText
          key={idx}
          text={item.label}
          preset="mask-up"
          delay={idx * data.framesPer}
          style={{ fontSize: 150 * u, fontWeight: 500, letterSpacing: "0.04em", color: brand.colors.text }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: idx === 0 ? 0 : flash }} />
    </AbsoluteFill>
  );
};
