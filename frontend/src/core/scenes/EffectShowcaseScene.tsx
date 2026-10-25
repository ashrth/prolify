import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Backdrop } from "../components/Backdrop";
import { ControlPanel } from "../components/ControlPanel";
import { clamp, useLayout } from "../layout";
import { enterStyle, outExpo } from "../presets";
import type { Brand, EffectShowcaseScene as ShowcaseData } from "../types";

/**
 * Result image on top, the effect's control panel below.
 * When the image changes (a new entry in `images`), it hard-cuts with a punch-zoom and flash,
 * in sync with whatever changes in the panel at the same frame.
 */
export const EffectShowcaseScene: React.FC<{ data: ShowcaseData; brand: Brand }> = ({ data, brand }) => {
  const frame = useCurrentFrame();
  const { u, fps, isVertical } = useLayout();

  const idx = Math.max(0, data.images.map((e) => frame >= e.at).lastIndexOf(true));
  const entry = data.images[idx];
  const local = frame - entry.at;
  const punch = idx > 0 ? interpolate(local, [0, 8], [1.06, 1], { ...clamp, easing: outExpo }) : 1;
  const flash = idx > 0 ? interpolate(local, [0, 4], [0.3, 0], clamp) : 0;
  const drift = interpolate(frame, [0, data.duration], [1, 1.04], clamp);

  const imgW = (data.imageWidth ?? (isVertical ? 820 : 640)) * u;
  const imgH = imgW / data.aspect;
  const panelW = (isVertical ? 880 : 700) * u;

  const image = (
    <div
      style={{
        position: "relative",
        width: imgW,
        height: imgH,
        borderRadius: 30 * u,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: `0 ${40 * u}px ${120 * u}px rgba(0,0,0,0.6)`,
        flexShrink: 0,
        ...enterStyle("rise", frame, fps, u),
      }}
    >
      <Img
        src={staticFile(entry.image)}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${punch * drift})` }}
      />
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </div>
  );

  const headline = data.headline ? (
    <AnimatedText
      text={data.headline}
      preset="mask-up"
      stagger={3}
      style={{ fontSize: 92 * u, fontWeight: 700, lineHeight: 1, color: brand.colors.text, textAlign: "center" }}
    />
  ) : null;

  const panel = (
    <div style={enterStyle("rise", frame - 4, fps, u)}>
      <ControlPanel sections={data.panel} width={panelW} />
    </div>
  );

  if (isVertical) {
    // headline + image from the top, panel anchored above the Reels caption area (may overlap the image's lower edge)
    return (
      <AbsoluteFill>
        <Backdrop brand={brand} />
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 140 * u, gap: 50 * u }}>
          {headline}
          {image}
        </AbsoluteFill>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 360 * u }}>{panel}</AbsoluteFill>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <Backdrop brand={brand} />
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 90 * u }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 * u }}>
          {headline}
          {image}
        </div>
        {panel}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
