import React from "react";
import type { Themes } from "../../src/gym/theme";

type Mode = "off" | "bw" | "boost";

const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step, onChange }) => (
  <label className="slider">
    <span>{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
    <span className="value">{value.toFixed(2)}</span>
  </label>
);

/** Black and white / color boost, with each theme's own exposure, contrast and brightness. */
export const ThemePanel: React.FC<{
  theme: Themes;
  onChange: (t: Themes) => void;
}> = ({ theme, onChange }) => {
  const mode: Mode = theme.blackAndWhite
    ? "bw"
    : theme.colorBoost
      ? "boost"
      : "off";
  const setMode = (m: Mode) =>
    onChange({
      ...theme,
      blackAndWhite: m === "bw",
      colorBoost: m === "boost",
    });
  const s = (mode === "bw" ? theme.bw : theme.boost) ?? {};
  const set = (key: string, v: number) =>
    onChange(
      mode === "bw"
        ? { ...theme, bw: { ...theme.bw, [key]: v } }
        : { ...theme, boost: { ...theme.boost, [key]: v } },
    );

  return (
    <div className="slot">
      <div className="slot-title">theme</div>
      <div className="row small-gap">
        {(["off", "bw", "boost"] as Mode[]).map((m) => (
          <button
            key={m}
            className={mode === m ? "pill on" : "pill"}
            onClick={() => setMode(m)}
          >
            {m === "off"
              ? "normal"
              : m === "bw"
                ? "black & white"
                : "color boost"}
          </button>
        ))}
      </div>
      {mode !== "off" ? (
        <div className="sliders">
          <Slider
            label="exposure"
            value={s.exposure ?? 0}
            min={-1}
            max={1}
            step={0.05}
            onChange={(v) => set("exposure", v)}
          />
          <Slider
            label="contrast"
            value={s.contrast ?? 1}
            min={0.5}
            max={2}
            step={0.05}
            onChange={(v) => set("contrast", v)}
          />
          <Slider
            label="brightness"
            value={s.brightness ?? 1}
            min={0.6}
            max={1.6}
            step={0.05}
            onChange={(v) => set("brightness", v)}
          />
          {mode === "boost" ? (
            <Slider
              label="color amount"
              value={theme.boost?.amount ?? 1.8}
              min={1}
              max={3}
              step={0.05}
              onChange={(v) => set("amount", v)}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
