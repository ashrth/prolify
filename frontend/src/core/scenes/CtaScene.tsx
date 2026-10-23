import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Backdrop } from "../components/Backdrop";
import { clamp, useLayout } from "../layout";
import { enterStyle } from "../presets";
import type { Brand, CtaScene as CtaData } from "../types";

export const CtaScene: React.FC<{ data: CtaData; brand: Brand }> = ({ data, brand }) => {
  const frame = useCurrentFrame();
  const { u, fps } = useLayout();

  const logo = spring({ frame, fps, config: { damping: 12, stiffness: 150 } });
  const glow = interpolate(frame, [0, 20], [0, 1], clamp) * (0.85 + Math.sin(frame / 12) * 0.15);

  return (
    <AbsoluteFill>
      <Backdrop brand={brand} glow={glow} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <Img
          src={staticFile(brand.logo)}
          style={{
            width: 190 * u,
            height: 190 * u,
            transform: `scale(${logo}) rotate(${(1 - logo) * -120}deg)`,
            marginBottom: 40 * u,
          }}
        />
        <AnimatedText
          text={data.wordmark ?? brand.name}
          preset="blur-in"
          delay={12}
          stagger={3}
          splitBy="char"
          style={{
            fontSize: 112 * u,
            fontWeight: 500,
            letterSpacing: "0.18em",
            marginRight: "-0.18em", // letter-spacing adds space after the last letter; this re-centers
            color: brand.colors.text,
            lineHeight: 1,
          }}
        />
        <div
          style={{
            marginTop: 64 * u,
            padding: `${26 * u}px ${64 * u}px`,
            borderRadius: 999,
            background: brand.colors.text,
            color: brand.colors.bg,
            fontSize: 38 * u,
            fontWeight: 500,
            letterSpacing: "0.16em",
            ...enterStyle("pop", frame - 36, fps, u),
          }}
        >
          {data.button}
        </div>
        <AnimatedText
          text={data.url}
          preset="rise"
          delay={48}
          style={{ marginTop: 30 * u, fontSize: 34 * u, letterSpacing: "0.06em", color: brand.colors.textMuted }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
