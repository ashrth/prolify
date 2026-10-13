import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Backdrop, ChromeField } from "../components/Backdrop";
import { useLayout } from "../layout";
import type { Brand, StatementScene as StatementData } from "../types";

export const StatementScene: React.FC<{ data: StatementData; brand: Brand }> = ({ data, brand }) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const [c1, c2, c3, c4] = brand.colors.chrome;

  // the chrome highlight slides across the letters over the whole scene
  const shine = interpolate(frame, [0, data.duration], [100, 0]);
  const chromeText: React.CSSProperties = {
    backgroundImage: `linear-gradient(100deg, ${c1} 0%, ${c2} 22%, ${c3} 38%, ${c4} 55%, ${c1} 75%, ${c2} 100%)`,
    backgroundSize: "250% 100%",
    backgroundPosition: `${shine}% 50%`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
  };

  return (
    <AbsoluteFill>
      <Backdrop brand={brand} />
      <ChromeField />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 100 * u, textAlign: "center" }}>
        {data.kicker ? (
          <AnimatedText
            text={data.kicker}
            preset="fade"
            style={{ fontSize: 30 * u, letterSpacing: "0.3em", color: brand.colors.textMuted, marginBottom: 34 * u }}
          />
        ) : null}
        <AnimatedText
          text={data.headline}
          preset="blur-in"
          delay={6}
          stagger={5}
          wordStyle={chromeText}
          style={{ fontSize: 150 * u, fontWeight: 500, lineHeight: 0.95, letterSpacing: "0.01em" }}
        />
        {data.sub ? (
          <AnimatedText
            text={data.sub}
            preset="rise"
            delay={20}
            style={{ fontSize: 44 * u, letterSpacing: "0.14em", color: brand.colors.text, marginTop: 38 * u }}
          />
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
