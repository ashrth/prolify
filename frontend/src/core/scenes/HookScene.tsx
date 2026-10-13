import React from "react";
import { AbsoluteFill } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Backdrop } from "../components/Backdrop";
import { CardWall } from "../components/CardWall";
import { useLayout, withAlpha } from "../layout";
import type { Brand, HookScene as HookData } from "../types";

export const HookScene: React.FC<{ data: HookData; brand: Brand }> = ({ data, brand }) => {
  const { u } = useLayout();
  return (
    <AbsoluteFill>
      <Backdrop brand={brand} />
      <CardWall images={data.cards} />
      {/* darken the middle so the headline always reads */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, ${withAlpha(brand.colors.bg, 0.85)} 0%, ${withAlpha(brand.colors.bg, 0.45)} 40%, transparent 75%)`,
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80 * u }}>
        {data.lines.map((line, i) => (
          <AnimatedText
            key={i}
            text={line}
            preset="slam"
            delay={6 + i * 20}
            style={{
              fontSize: 170 * u,
              fontWeight: 500,
              lineHeight: 0.95,
              color: brand.colors.text,
              textAlign: "center",
            }}
          />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
