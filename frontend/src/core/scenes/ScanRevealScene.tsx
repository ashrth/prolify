import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { clamp, useLayout } from "../layout";
import type { Brand, ScanRevealScene as ScanData } from "../types";

/** Full-bleed: a glowing line scans top to bottom, turning `before` into `after`. Then the headline slams in. */
export const ScanRevealScene: React.FC<{ data: ScanData; brand: Brand }> = ({ data, brand }) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();

  const p = interpolate(frame, [data.scanFrom, data.scanTo], [0, 100], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const scanning = frame >= data.scanFrom && frame <= data.scanTo + 2;
  const push = interpolate(frame, [0, data.duration], [1.04, 1.12], clamp);
  const textAt = data.scanTo + 2;
  const darken = interpolate(frame, [textAt, textAt + 8], [0, 0.45], clamp);

  const img = (src: string): React.ReactNode => (
    <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: data.objectPosition ?? "50% 50%" }} />
  );

  return (
    <AbsoluteFill style={{ background: brand.colors.bg }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <AbsoluteFill>{img(data.before)}</AbsoluteFill>
        <AbsoluteFill style={{ clipPath: `inset(0 0 ${100 - p}% 0)` }}>{img(data.after)}</AbsoluteFill>
      </AbsoluteFill>

      {/* the scan line */}
      {scanning ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${p}%`,
            height: 6 * u,
            marginTop: -3 * u,
            background: "#fff",
            boxShadow: `0 0 ${30 * u}px ${8 * u}px rgba(255,255,255,0.6), 0 0 ${120 * u}px ${30 * u}px ${brand.colors.accent}`,
          }}
        />
      ) : null}

      <AbsoluteFill style={{ background: "#000", opacity: darken }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: 70 * u }}>
        <AnimatedText
          text={data.headline}
          preset="slam"
          delay={textAt}
          style={{ fontSize: 170 * u, fontWeight: 700, lineHeight: 0.95, color: brand.colors.text }}
        />
        {data.sub ? (
          <AnimatedText
            text={data.sub}
            preset="rise"
            delay={textAt + 10}
            style={{ fontSize: 44 * u, fontWeight: 500, letterSpacing: "0.14em", color: brand.colors.text, marginTop: 30 * u }}
          />
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
