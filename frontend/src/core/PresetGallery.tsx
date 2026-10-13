import React from "react";
import { AbsoluteFill, Loop } from "remotion";
import { AnimatedText } from "./components/AnimatedText";
import { fontFamily } from "./fonts";
import { PRESETS } from "./presets";

/**
 * Every preset playing on a loop, labeled with its name.
 * Open it in the Studio, pick the ones you like, then refer to them by name.
 */
export const PresetGallery: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily,
      background: "#05050A",
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gridTemplateRows: "repeat(2, 1fr)",
    }}
  >
    {PRESETS.map((preset) => (
      <div
        key={preset}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
        }}
      >
        <Loop durationInFrames={60} layout="none">
          <AnimatedText
            text="FINISHED POST."
            preset={preset}
            delay={6}
            stagger={preset === "mask-up" || preset === "blur-in" ? 4 : 0}
            style={{ fontSize: 72, fontWeight: 500, color: "#fff" }}
          />
        </Loop>
        <div style={{ position: "absolute", bottom: 40, fontSize: 26, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)" }}>
          {preset}
        </div>
      </div>
    ))}
  </AbsoluteFill>
);
