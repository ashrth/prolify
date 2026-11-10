import React from "react";
import { random, staticFile, Img, useCurrentFrame } from "remotion";
import { captionFonts } from "./fonts";
import type { CaptionFontName, FrameName, PolaroidLook } from "./types";

/** The app's default slider values. A scene only animates the sliders it lists; the rest stay here. */
export const DEFAULT_LOOK: PolaroidLook = {
  intensity: 100,
  fade: 50,
  warmth: 50,
  shadowTint: 50,
  softness: 30,
  grain: 30,
  vignette: 40,
  lightLeak: 20,
};

/** Proportions measured from a real export. Card width = 1. */
export const CARD = { side: 0.0493, top: 0.0585, photo: 0.9013, bottom: 0.2002, ratio: 1.16 } as const;

const PAPER: Record<FrameName, { paper: string; ink: string }> = {
  cream: { paper: "#E9E3D5", ink: "#2A2927" },
  white: { paper: "#F5F4F0", ink: "#2A2927" },
  black: { paper: "#161616", ink: "#E9E3D5" },
};

const rgb = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mixColor = (a: string, b: string, t: number) => {
  const A = rgb(a);
  const B = rgb(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
};

type CardProps = {
  width: number; // px
  frame: FrameName;
  frameTo?: FrameName; // crossfade towards this frame...
  mix?: number; // ...by this much (0–1)
  caption?: string;
  font?: CaptionFontName;
  captionScale?: number; // for a little pop when the caption or font changes
  children: React.ReactNode; // the photo: fills the square
  style?: React.CSSProperties;
};

/** A polaroid: paper frame, square photo, handwritten caption. */
export const PolaroidCard: React.FC<CardProps> = ({ width: W, frame, frameTo, mix = 0, caption, font = "marker", captionScale = 1, children, style }) => {
  const a = PAPER[frame];
  const b = PAPER[frameTo ?? frame];
  const paper = mixColor(a.paper, b.paper, mix);
  const ink = mixColor(a.ink, b.ink, mix);
  const cf = captionFonts[font];
  const dark = (frameTo ?? frame) === "black" && mix > 0.5;

  return (
    <div
      style={{
        position: "relative",
        width: W,
        height: W * CARD.ratio,
        background: paper,
        borderRadius: W * 0.008,
        boxShadow: `0 ${W * 0.05}px ${W * 0.14}px rgba(0,0,0,0.6), 0 ${W * 0.01}px ${W * 0.025}px rgba(0,0,0,0.45)`,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: W * CARD.side,
          top: W * CARD.top,
          width: W * CARD.photo,
          height: W * CARD.photo,
          overflow: "hidden",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.2)",
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: W * (CARD.top + CARD.photo),
          height: W * CARD.bottom,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: ink,
          fontFamily: cf.family,
          fontSize: W * cf.size,
          whiteSpace: "nowrap",
          transform: `scale(${captionScale})`,
        }}
      >
        {caption}
      </div>
      {/* a little light across the paper, so it doesn't look flat */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: W * 0.008,
          background: dark
            ? "linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0) 55%)"
            : "linear-gradient(160deg, rgba(255,255,255,0.35), rgba(0,0,0,0.05) 70%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

const fill: React.CSSProperties = { position: "absolute", inset: 0 };
const cover: React.CSSProperties = { ...fill, width: "100%", height: "100%", objectFit: "cover" };

type LookProps = {
  src: string; // the photo with no effect
  look: PolaroidLook;
  size: number; // px, the photo's side (used for blur strength)
  zoom?: number;
  position?: string; // where to zoom, e.g. "75% 15%"
};

/**
 * The polaroid look made live from CSS, so it can change as a slider moves:
 * fade lifts the blacks, warmth tints, shadow tint colors the darks, softness blurs,
 * grain, vignette and light leak are overlays. `intensity` mixes it with the clean photo.
 * It's a close approximation of the app's effect, not the app's own output.
 */
export const LookPhoto: React.FC<LookProps> = ({ src, look, size, zoom = 1, position = "50% 50%" }) => {
  const frame = useCurrentFrame();
  const n = Math.floor(frame / 2);
  const it = look.intensity / 100;
  const fade = look.fade / 100;
  const warm = (look.warmth - 50) / 50; // -1 cool … +1 warm
  const tint = look.shadowTint / 100;
  const soft = look.softness / 100;
  const grain = look.grain / 100;
  const vig = look.vignette / 100;
  const leak = look.lightLeak / 100;
  const origin = position;

  return (
    <div style={{ ...fill, overflow: "hidden", background: "#000" }}>
      <Img src={staticFile(src)} style={{ ...cover, transformOrigin: origin, transform: `scale(${zoom})` }} />

      <div style={{ ...fill, opacity: it }}>
        <Img
          src={staticFile(src)}
          style={{
            ...cover,
            transformOrigin: origin,
            transform: `scale(${zoom * (1 + soft * 0.04)})`, // a touch bigger so the blur doesn't show dark edges
            filter: `contrast(${1 - 0.3 * fade}) brightness(${1 + 0.06 * fade}) saturate(${1 - 0.25 * fade}) blur(${soft * 0.008 * size}px)`,
          }}
        />
        {/* fade: lifts the blacks to a soft gray-brown */}
        <div style={{ ...fill, background: "rgb(64,58,52)", mixBlendMode: "lighten", opacity: fade * 0.9 }} />
        {/* warmth: orange when warm, blue when cool */}
        <div
          style={{
            ...fill,
            background: warm >= 0 ? "rgb(255,150,70)" : "rgb(70,140,255)",
            mixBlendMode: "color",
            opacity: Math.abs(warm) * 0.45, // 50 = neutral, like the app
          }}
        />
        {/* shadow tint: colors only the dark parts */}
        <div style={{ ...fill, background: "rgb(22,48,52)", mixBlendMode: "lighten", opacity: Math.max(0, tint - 0.5) * 1.3 }} />
        {/* light leak: a warm glow coming in from the left, drifting slowly */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "-10%",
            width: "120%",
            background: "linear-gradient(75deg, rgba(255,70,20,0.95) 0%, rgba(255,160,50,0.55) 22%, rgba(255,200,120,0) 55%)",
            mixBlendMode: "screen",
            opacity: Math.min(1, leak * leak * 1.6), // barely there at the default 20, strong near 100
            transform: `translateX(${Math.sin(frame / 22) * 4}%)`,
          }}
        />
        {/* grain */}
        <div
          style={{
            ...fill,
            backgroundImage: `url(${staticFile("core/grain.png")})`,
            backgroundSize: "512px 512px",
            backgroundPosition: `${Math.floor(random(`pgx-${n}`) * 512)}px ${Math.floor(random(`pgy-${n}`) * 512)}px`,
            mixBlendMode: "overlay",
            opacity: grain * 0.55,
          }}
        />
        {/* vignette */}
        <div style={{ ...fill, background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)", opacity: vig * 0.5 }} />
      </div>
    </div>
  );
};
