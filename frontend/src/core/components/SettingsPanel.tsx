import React from "react";
import { Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { clamp, useLayout } from "../layout";
import type { PanelSlider } from "../types";

const dragEase = Easing.bezier(0.45, 0, 0.2, 1);

/** Current value of a slider at a frame. */
export const sliderValue = (s: PanelSlider, frame: number) =>
  s.start === undefined || s.end === undefined
    ? s.to
    : interpolate(frame, [s.start, s.end], [s.from, s.to], { ...clamp, easing: dragEase });

const isDragging = (s: PanelSlider, frame: number) =>
  s.start !== undefined && s.end !== undefined && frame >= s.start && frame <= s.end + 2;

type Props = {
  title: string;
  modes: string[];
  activeMode: number;
  previousMode?: number;
  clickAt: number;
  sliders: PanelSlider[];
  width: number;
};

/** A rebuild of the app's effect settings panel, with sliders that move. */
export const SettingsPanel: React.FC<Props> = ({ title, modes, activeMode, previousMode, clickAt, sliders, width }) => {
  const frame = useCurrentFrame();
  const { u, fps } = useLayout();
  const active = frame >= clickAt ? activeMode : previousMode;
  const press = spring({ frame: frame - clickAt, fps, config: { damping: 10, stiffness: 300 } });

  return (
    <div
      style={{
        width,
        padding: `${40 * u}px ${44 * u}px ${44 * u}px`,
        borderRadius: 32 * u,
        background: "rgba(10,10,16,0.92)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: `0 ${30 * u}px ${90 * u}px rgba(0,0,0,0.6)`,
        backdropFilter: "blur(20px)",
      }}
    >
      <div style={{ fontSize: 24 * u, letterSpacing: "0.22em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
        {title}
      </div>

      {/* mode pills */}
      <div style={{ display: "flex", gap: 14 * u, marginTop: 24 * u }}>
        {modes.map((m, i) => {
          const isActive = i === active;
          const justClicked = i === activeMode && frame >= clickAt;
          return (
            <div
              key={m}
              style={{
                flex: 1,
                height: 70 * u,
                borderRadius: 16 * u,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30 * u,
                background: isActive ? "#fff" : "#17171D",
                color: isActive ? "#05050A" : "rgba(255,255,255,0.6)",
                transform: justClicked ? `scale(${0.92 + 0.08 * press})` : undefined,
              }}
            >
              {m}
            </div>
          );
        })}
      </div>

      {/* sliders */}
      {sliders.map((s) => {
        const v = sliderValue(s, frame);
        const p = (v - (s.min ?? 0)) / (s.max - (s.min ?? 0));
        const dragging = isDragging(s, frame);
        return (
          <div key={s.label} style={{ marginTop: 30 * u }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 31 * u, color: dragging ? "#fff" : "rgba(255,255,255,0.85)" }}>{s.label}</span>
              <span style={{ fontSize: 29 * u, color: dragging ? "#fff" : "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>
                {Math.round(v)}
                {s.suffix ?? ""}
              </span>
            </div>
            <div style={{ position: "relative", height: 36 * u, marginTop: 10 * u }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 11 * u,
                  height: 14 * u,
                  borderRadius: 999,
                  background: "#3A3A40",
                  border: `${1.5 * u}px solid rgba(255,255,255,0.25)`,
                  overflow: "hidden",
                }}
              >
                <div style={{ width: `calc(${p} * (100% - ${36 * u}px) + ${18 * u}px)`, height: "100%", background: "#fff" }} />
              </div>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: `calc(${p} * (100% - ${36 * u}px))`,
                  width: 36 * u,
                  height: 36 * u,
                  borderRadius: "50%",
                  background: "#fff",
                  transform: `scale(${dragging ? 1.18 : 1})`,
                  boxShadow: dragging ? `0 0 0 ${10 * u}px rgba(255,255,255,0.15)` : `0 ${2 * u}px ${8 * u}px rgba(0,0,0,0.4)`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
