import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Backdrop } from "../components/Backdrop";
import { clamp, useLayout } from "../layout";
import { enterStyle } from "../presets";
import type { Brand, SwapHookScene as SwapData } from "../types";

/** Lines hard-cut every `framesPer` frames; the final line slams in bigger and holds, with a glow. */
export const SwapHookScene: React.FC<{ data: SwapData; brand: Brand }> = ({ data, brand }) => {
  const frame = useCurrentFrame();
  const { u, fps } = useLayout();

  const last = data.lines.length - 1;
  const idx = Math.min(Math.floor(frame / data.framesPer), last);
  const isFinal = idx === last;
  const finalStart = last * data.framesPer;
  const line = data.lines[idx];
  const size = (isFinal ? 300 : 210) * u;
  const glow = isFinal ? interpolate(frame, [finalStart, finalStart + 10], [0, 1], clamp) : 0;

  return (
    <AbsoluteFill>
      <Backdrop brand={brand} glow={glow} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: 60 * u }}>
        <div
          key={idx}
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 20 * u,
            color: brand.colors.text,
            ...enterStyle("slam", frame - idx * data.framesPer, fps, u),
          }}
        >
          <span style={{ fontSize: size, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.01em" }}>{line.main}</span>
          {line.small ? (
            <span style={{ fontSize: size * 0.3, fontWeight: 500, color: isFinal ? brand.colors.text : brand.colors.textMuted }}>
              {line.small}
            </span>
          ) : null}
        </div>
        {isFinal && data.sub ? (
          <AnimatedText
            text={data.sub}
            preset="rise"
            delay={finalStart + 10}
            style={{ fontSize: 44 * u, letterSpacing: "0.12em", color: brand.colors.textMuted, marginTop: 40 * u }}
          />
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
