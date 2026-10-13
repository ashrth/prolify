import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Backdrop } from "../components/Backdrop";
import { clamp, useLayout } from "../layout";
import { outExpo } from "../presets";
import type { Brand, StrikeListScene as StrikeData } from "../types";

const APPEAR_EVERY = 20; // frames between items
const STRIKE_AFTER = 10; // frames after an item appears before it gets crossed out

export const StrikeListScene: React.FC<{ data: StrikeData; brand: Brand }> = ({ data, brand }) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();

  return (
    <AbsoluteFill>
      <Backdrop brand={brand} />
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", gap: 28 * u, padding: 80 * u }}
      >
        {data.items.map((item, i) => {
          const start = 4 + i * APPEAR_EVERY;
          const strike = interpolate(frame, [start + STRIKE_AFTER, start + STRIKE_AFTER + 8], [0, 1], {
            ...clamp,
            easing: outExpo,
          });
          return (
            <div key={i} style={{ position: "relative", opacity: 1 - strike * 0.6 }}>
              <AnimatedText
                text={item}
                preset="mask-up"
                delay={start}
                style={{
                  fontSize: 104 * u,
                  fontWeight: 500,
                  lineHeight: 1,
                  color: brand.colors.text,
                  textAlign: "center",
                  letterSpacing: "0.02em",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: -12 * u,
                  right: -12 * u,
                  top: "50%",
                  height: 8 * u,
                  marginTop: -6 * u,
                  background: brand.colors.text,
                  transform: `scaleX(${strike})`,
                  transformOrigin: "left center",
                }}
              />
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
