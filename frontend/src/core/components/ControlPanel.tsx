import React from "react";
import { interpolate, spring, useCurrentFrame } from "remotion";
import { clamp, useLayout } from "../layout";
import { enterStyle } from "../presets";
import type { ControlSection, PanelSlider } from "../types";
import { sliderValue } from "./SettingsPanel";

/** The latest entry whose `at` has passed. */
const current = <T extends { at: number }>(list: T[], frame: number): T | undefined =>
  [...list].reverse().find((e) => frame >= e.at) ?? list[0];

const Label: React.FC<{ text: string }> = ({ text }) => {
  const { u } = useLayout();
  return <div style={{ fontSize: 31 * u, color: "rgba(255,255,255,0.85)", marginBottom: 16 * u }}>{text}</div>;
};

const Pills: React.FC<{ section: Extract<ControlSection, { kind: "pills" }> }> = ({ section }) => {
  const frame = useCurrentFrame();
  const { u, fps } = useLayout();
  const sel = current(section.select, frame);
  const active = sel?.index ?? 0;
  const pop = sel ? spring({ frame: frame - sel.at, fps, config: { damping: 10, stiffness: 300 } }) : 1;
  return (
    <div>
      {section.label ? <Label text={section.label} /> : null}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${section.columns ?? section.options.length}, 1fr)`, gap: 14 * u }}>
        {section.options.map((o, i) => (
          <div
            key={o}
            style={{
              height: 68 * u,
              borderRadius: 16 * u,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 29 * u,
              fontWeight: 500,
              background: i === active ? "#fff" : "#17171D",
              color: i === active ? "#05050A" : "rgba(255,255,255,0.6)",
              transform: i === active ? `scale(${0.92 + 0.08 * pop})` : undefined,
            }}
          >
            {o}
          </div>
        ))}
      </div>
    </div>
  );
};

const Swatch: React.FC<{ section: Extract<ControlSection, { kind: "swatch" }> }> = ({ section }) => {
  const frame = useCurrentFrame();
  const { u, fps } = useLayout();
  const showAt = section.showAt ?? 0;
  if (frame < showAt) return null;
  const color = current(section.colors, frame)?.color ?? "#fff";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...enterStyle("pop", frame - showAt, fps, u) }}>
      {section.label ? <span style={{ fontSize: 31 * u, color: "rgba(255,255,255,0.85)" }}>{section.label}</span> : <span />}
      <div style={{ width: 72 * u, height: 72 * u, borderRadius: 6 * u, background: color, border: `${2 * u}px solid rgba(255,255,255,0.35)` }} />
    </div>
  );
};

const Slider: React.FC<{ s: PanelSlider }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const v = sliderValue(s, frame);
  const min = s.min ?? 0;
  const p = (v - min) / (s.max - min);
  const dragging = s.start !== undefined && s.end !== undefined && frame >= s.start && frame <= s.end + 2;
  const glow = dragging ? 1 : 0;
  return (
    <div>
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
            transform: `scale(${1 + 0.18 * glow})`,
            boxShadow: glow ? `0 0 0 ${10 * u}px rgba(255,255,255,0.15)` : `0 ${2 * u}px ${8 * u}px rgba(0,0,0,0.4)`,
          }}
        />
      </div>
    </div>
  );
};

/** A rebuild of an effect's control panel from a list of sections. */
export const ControlPanel: React.FC<{ sections: ControlSection[]; width: number }> = ({ sections, width }) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const fadeIn = interpolate(frame, [0, 6], [0, 1], clamp);
  return (
    <div
      style={{
        width,
        padding: `${38 * u}px ${44 * u}px ${44 * u}px`,
        borderRadius: 32 * u,
        background: "rgba(10,10,16,0.94)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: `0 ${30 * u}px ${90 * u}px rgba(0,0,0,0.6)`,
        display: "flex",
        flexDirection: "column",
        gap: 30 * u,
        opacity: fadeIn,
      }}
    >
      {sections.map((sec, i) => {
        switch (sec.kind) {
          case "title":
            return (
              <div key={i} style={{ fontSize: 26 * u, fontWeight: 600, letterSpacing: "0.22em", color: "rgba(255,255,255,0.45)" }}>
                {sec.text}
              </div>
            );
          case "pills":
            return <Pills key={i} section={sec} />;
          case "swatch":
            return <Swatch key={i} section={sec} />;
          case "slider":
            return <Slider key={i} s={sec.slider} />;
        }
      })}
    </div>
  );
};
