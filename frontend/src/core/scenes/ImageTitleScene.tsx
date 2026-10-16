import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { clamp, useLayout } from "../layout";
import { outExpo } from "../presets";
import type { Brand, ImageTitleScene as TitleData } from "../types";

/** Full-bleed image pulling back, headline slammed over it. A strong hook. */
export const ImageTitleScene: React.FC<{ data: TitleData; brand: Brand }> = ({ data, brand }) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const pull = interpolate(frame, [0, data.duration], [1.18, 1.02], { ...clamp, easing: outExpo });

  return (
    <AbsoluteFill style={{ background: brand.colors.bg }}>
      <AbsoluteFill style={{ transform: `scale(${pull})` }}>
        <Img src={staticFile(data.image)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.5) 100%)" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: 70 * u }}>
        {data.kicker ? (
          <AnimatedText
            text={data.kicker}
            preset="fade"
            style={{ fontSize: 30 * u, letterSpacing: "0.3em", color: brand.colors.textMuted, marginBottom: 30 * u }}
          />
        ) : null}
        <AnimatedText
          text={data.headline}
          preset="slam"
          delay={4}
          style={{ fontSize: 150 * u, fontWeight: 500, lineHeight: 0.95, color: brand.colors.text }}
        />
        {data.sub ? (
          <AnimatedText
            text={data.sub}
            preset="rise"
            delay={16}
            stagger={4}
            style={{ fontSize: 42 * u, letterSpacing: "0.14em", color: brand.colors.text, marginTop: 34 * u }}
          />
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
