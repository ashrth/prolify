import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Backdrop } from "../components/Backdrop";
import { clamp, useLayout } from "../layout";
import { enterStyle } from "../presets";
import type { Brand, StepsScene as StepsData } from "../types";

export const StepsScene: React.FC<{ data: StepsData; brand: Brand }> = ({ data, brand }) => {
  const frame = useCurrentFrame();
  const { u, isVertical, fps } = useLayout();

  const imgH = (isVertical ? 900 : 820) * u;
  const imgW = imgH * data.aspect;
  const zoom = interpolate(frame, [0, data.duration], [1, 1.1], clamp);

  return (
    <AbsoluteFill>
      <Backdrop brand={brand} />
      <AbsoluteFill
        style={{
          flexDirection: isVertical ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: (isVertical ? 70 : 110) * u,
          padding: 100 * u,
        }}
      >
        <div style={{ width: isVertical ? "100%" : 860 * u, display: "flex", flexDirection: "column", gap: 22 * u }}>
          {data.steps.map((step, i) => (
            <AnimatedText
              key={i}
              text={step}
              preset="mask-up"
              delay={8 + i * 16}
              style={{
                fontSize: 82 * u,
                fontWeight: 500,
                lineHeight: 1,
                letterSpacing: "0.02em",
                color: brand.colors.text,
                textAlign: isVertical ? "center" : "left",
              }}
            />
          ))}
        </div>

        <div
          style={{
            width: imgW,
            height: imgH,
            flexShrink: 0,
            borderRadius: 24 * u,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: `0 ${40 * u}px ${120 * u}px rgba(0,0,0,0.6)`,
            ...enterStyle("rise", frame, fps, u),
          }}
        >
          <Img
            src={staticFile(data.image)}
            style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, transformOrigin: "40% 45%" }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
