import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Backdrop } from "../components/Backdrop";
import { clamp, useLayout } from "../layout";
import { enterStyle, outExpo } from "../presets";
import type { Brand, EffectFlipScene as FlipData } from "../types";

/**
 * Hard-cuts through effects on a fixed rhythm: big name on one side,
 * the effect on the other, a small punch-zoom + flash on every cut.
 * Ends on a mosaic of all effects with the outro line.
 */
export const EffectFlipScene: React.FC<{ data: FlipData; brand: Brand }> = ({ data, brand }) => {
  const frame = useCurrentFrame();
  const { u, isVertical, fps } = useLayout();

  const n = data.effects.length;
  const fpe = data.framesPerEffect;
  const flipEnd = n * fpe;
  const inOutro = frame >= flipEnd && Boolean(data.outro);
  const idx = Math.min(Math.floor(frame / fpe), n - 1);
  const local = frame - idx * fpe;

  const punch = interpolate(local, [0, 10], [1.08, 1], { ...clamp, easing: outExpo });
  const flash = interpolate(local, [0, 5], [0.3, 0], clamp);
  const cardSize = (isVertical ? 760 : 620) * u;

  const nameStyle: React.CSSProperties = {
    fontSize: 124 * u,
    fontWeight: 500,
    lineHeight: 0.95,
    letterSpacing: "0.02em",
    color: brand.colors.text,
    textAlign: isVertical ? "center" : "left",
  };

  const frameStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: 28 * u,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: `0 ${40 * u}px ${120 * u}px rgba(0,0,0,0.6)`,
  };

  return (
    <AbsoluteFill>
      <Backdrop brand={brand} />
      <AbsoluteFill
        style={{
          flexDirection: isVertical ? "column-reverse" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: (isVertical ? 80 : 140) * u,
          padding: 100 * u,
        }}
      >
        {/* name + progress ticks */}
        <div style={{ width: isVertical ? "100%" : 820 * u }}>
          {inOutro ? (
            <AnimatedText key="outro" text={data.outro ?? ""} preset="mask-up" delay={flipEnd} style={nameStyle} />
          ) : (
            <AnimatedText key={idx} text={data.effects[idx].name} preset="mask-up" delay={idx * fpe} style={nameStyle} />
          )}
          <div
            style={{
              display: "flex",
              gap: 10 * u,
              marginTop: 44 * u,
              justifyContent: isVertical ? "center" : "flex-start",
            }}
          >
            {data.effects.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 46 * u,
                  height: 4 * u,
                  borderRadius: 2 * u,
                  background: inOutro || i <= idx ? brand.colors.text : "rgba(255,255,255,0.18)",
                }}
              />
            ))}
          </div>
        </div>

        {/* the effect itself */}
        <div
          style={{
            width: cardSize,
            height: cardSize,
            position: "relative",
            flexShrink: 0,
            ...enterStyle("rise", frame, fps, u),
          }}
        >
          {inOutro ? (
            <div style={{ ...frameStyle, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 * u, background: brand.colors.panel, padding: 10 * u }}>
              {data.effects.map((e, i) => (
                <div key={i} style={{ borderRadius: 14 * u, overflow: "hidden", ...enterStyle("pop", frame - flipEnd - i * 3, fps, u) }}>
                  <Img src={staticFile(e.image)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={frameStyle}>
              <Img
                src={staticFile(data.effects[idx].image)}
                style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${punch})` }}
              />
              <AbsoluteFill style={{ background: "#fff", opacity: idx === 0 ? 0 : flash }} />
            </div>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
