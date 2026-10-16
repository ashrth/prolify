import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Backdrop } from "../components/Backdrop";
import { LiveMotionBlur } from "../components/LiveMotionBlur";
import { SettingsPanel, sliderValue } from "../components/SettingsPanel";
import { clamp, useLayout } from "../layout";
import { enterStyle } from "../presets";
import type { Brand, EffectDemoScene as DemoData, PanelSlider } from "../types";

/**
 * Photo + the app's settings panel. Sliders animate, and the photo blurs live
 * as they move. At `revealAt` it crossfades to the app's real output.
 */
export const EffectDemoScene: React.FC<{ data: DemoData; brand: Brand }> = ({ data, brand }) => {
  const frame = useCurrentFrame();
  const { u, isVertical, fps } = useLayout();

  const find = (d: PanelSlider["drives"]) => data.sliders.find((s) => s.drives === d);
  const amountSlider = find("amount");
  const cxSlider = find("centerX");
  const cySlider = find("centerY");

  const progress = amountSlider ? sliderValue(amountSlider, frame) / amountSlider.to : 1;
  const center = {
    x: cxSlider ? sliderValue(cxSlider, frame) / cxSlider.max : 0.5,
    y: cySlider ? sliderValue(cySlider, frame) / cySlider.max : 0.5,
  };

  // crosshair shows while the center is being moved
  const centerMoves = [cxSlider, cySlider].filter((s): s is PanelSlider => s?.start !== undefined && s?.end !== undefined);
  const crossStart = Math.min(...centerMoves.map((s) => s.start as number));
  const crossEnd = Math.max(...centerMoves.map((s) => s.end as number));
  const crosshair = centerMoves.length
    ? interpolate(frame, [crossStart - 4, crossStart, crossEnd + 6, crossEnd + 14], [0, 1, 1, 0], clamp)
    : 0;

  const reveal = interpolate(frame, [data.revealAt, data.revealAt + 8], [0, 1], clamp);
  const settle = interpolate(frame, [data.revealAt, data.duration], [1, 1.04], clamp);

  const photoW = (isVertical ? 800 : 620) * u;
  const photoH = photoW / data.aspect;
  const panelW = (isVertical ? 860 : 700) * u;

  const photo = (
    <div
      style={{
        position: "relative",
        width: photoW,
        height: photoH,
        borderRadius: 30 * u,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
        flexShrink: 0,
        ...enterStyle("rise", frame, fps, u),
      }}
    >
      <AbsoluteFill style={{ transform: `scale(${settle})` }}>
        <LiveMotionBlur
          src={data.image}
          kind={data.blur.kind}
          amount={data.blur.full * progress}
          angle={data.blur.angle}
          center={center}
          intensity={0.86}
        />
        <Img
          src={staticFile(data.result)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: reveal }}
        />
      </AbsoluteFill>

      {/* crosshair at the blur center */}
      {crosshair > 0 ? (
        <div
          style={{
            position: "absolute",
            left: `${center.x * 100}%`,
            top: `${center.y * 100}%`,
            width: 70 * u,
            height: 70 * u,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: `${3 * u}px solid #fff`,
            opacity: crosshair,
            boxShadow: "0 0 0 1px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 10 * u, height: 10 * u, borderRadius: "50%", background: "#fff", transform: "translate(-50%, -50%)" }} />
        </div>
      ) : null}

      {/* mode name on the photo */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, padding: `${36 * u}px ${40 * u}px ${80 * u}px`, background: "linear-gradient(rgba(0,0,0,0.55), transparent)" }}>
        <AnimatedText
          text={data.title}
          preset="mask-up"
          delay={2}
          style={{ fontSize: 96 * u, fontWeight: 500, letterSpacing: "0.04em", lineHeight: 1, color: brand.colors.text }}
        />
      </div>
    </div>
  );

  const panel = (
    <div style={enterStyle("rise", frame - 3, fps, u)}>
      <SettingsPanel
        title={data.panelTitle}
        modes={data.modes}
        activeMode={data.activeMode}
        previousMode={data.previousMode}
        clickAt={data.clickAt}
        sliders={data.sliders}
        width={panelW}
      />
    </div>
  );

  if (isVertical) {
    // photo high, panel floating over its lower edge; keeps everything above the Reels caption area
    return (
      <AbsoluteFill>
        <Backdrop brand={brand} />
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 130 * u }}>{photo}</AbsoluteFill>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 360 * u }}>{panel}</AbsoluteFill>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <Backdrop brand={brand} />
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 90 * u }}>
        {photo}
        {panel}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
