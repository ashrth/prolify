import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Backdrop } from "../components/Backdrop";
import { Cursor } from "../components/Cursor";
import { clamp, useLayout } from "../layout";
import type { Brand, BrowserDemoScene as BrowserData } from "../types";

export const BrowserDemoScene: React.FC<{ data: BrowserData; brand: Brand }> = ({ data, brand }) => {
  const frame = useCurrentFrame();
  const { u, isVertical, fps } = useLayout();

  const browserW = (isVertical ? 980 : 1440) * u;
  const shotH = browserW / data.aspect;
  const barH = 52 * u;

  // browser swings up from below and un-tilts
  const s = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  const enterY = interpolate(s, [0, 1], [460 * u, 0]);
  const tilt = interpolate(s, [0, 1], [24, 0]);

  // slow push-in toward the click target
  const target = data.click ?? { x: 0.5, y: 0.5, atFrame: 0 };
  const zoom = interpolate(frame, [20, data.duration], [1, 1.2], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <AbsoluteFill>
      <Backdrop brand={brand} />
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", gap: 56 * u, padding: 60 * u }}
      >
        <div style={{ textAlign: "center" }}>
          {data.caption.map((line, i) => (
            <AnimatedText
              key={i}
              text={line}
              preset="rise"
              delay={i * 8}
              style={{
                fontSize: (i === 0 ? 72 : 44) * u,
                fontWeight: i === 0 ? 500 : 400,
                letterSpacing: i === 0 ? "0.04em" : "0.14em",
                lineHeight: 1.15,
                color: i === 0 ? brand.colors.text : brand.colors.textMuted,
                marginTop: i === 0 ? 0 : 12 * u,
              }}
            />
          ))}
        </div>

        <div
          style={{
            width: browserW,
            borderRadius: 18 * u,
            overflow: "hidden",
            background: brand.colors.panel,
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: `0 ${50 * u}px ${140 * u}px rgba(0,0,0,0.7)`,
            transform: `perspective(${2200 * u}px) translateY(${enterY}px) rotateX(${tilt}deg)`,
            flexShrink: 0,
          }}
        >
          {/* top bar */}
          <div style={{ height: barH, display: "flex", alignItems: "center", padding: `0 ${20 * u}px`, gap: 9 * u, position: "relative" }}>
            {[0, 1, 2].map((d) => (
              <div key={d} style={{ width: 13 * u, height: 13 * u, borderRadius: "50%", background: "rgba(255,255,255,0.18)" }} />
            ))}
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                padding: `${7 * u}px ${28 * u}px`,
                borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                color: brand.colors.textMuted,
                fontSize: 19 * u,
                letterSpacing: "0.04em",
              }}
            >
              {data.url}
            </div>
          </div>

          {/* screenshot + cursor, zoomed together */}
          <div style={{ width: browserW, height: shotH, overflow: "hidden", position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: `scale(${zoom})`,
                transformOrigin: `${target.x * 100}% ${target.y * 100}%`,
              }}
            >
              <Img src={staticFile(data.screenshot)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {data.click ? (
                <Cursor from={{ x: 0.78, y: 0.95 }} to={{ x: data.click.x, y: data.click.y }} clickAt={data.click.atFrame} />
              ) : null}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
