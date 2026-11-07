import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts } from "../fonts";
import { clamp } from "../layout";
import type { Caption } from "../types";

/** A caption drawn above every scene. Set `caption` on the video script. */
export const CaptionOverlay: React.FC<{ caption: Caption }> = ({ caption }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  const isVertical = height > width;

  const from = caption.from ?? 0;
  const until = caption.until ?? durationInFrames;
  // fade in and out, but never longer than half the time the caption is up
  const fade = Math.max(1, Math.min(caption.fade ?? 12, Math.floor((until - from) / 2) - 1));
  const opacity = interpolate(frame, [from, from + fade, until - fade, until], [0, 1, 1, 0], clamp);

  const position = caption.position ?? "bottom";
  // vertical videos keep clear of the app's own buttons and captions at the bottom
  const edge = (isVertical ? 300 : 90) * u;

  return (
    <AbsoluteFill
      style={{
        zIndex: 5000, // above everything, including shots that sit on top of others
        justifyContent: position === "bottom" ? "flex-end" : position === "top" ? "flex-start" : "center",
        alignItems: "center",
        padding: `${position === "top" ? (isVertical ? 200 * u : edge) : 0}px ${80 * u}px ${position === "bottom" ? edge : 0}px`,
        opacity,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: caption.font ? fonts[caption.font] : undefined,
          fontSize: (caption.size ?? 64) * u,
          lineHeight: 1.15,
          letterSpacing: "0.05em",
          textAlign: "center",
          textTransform: caption.uppercase ? "uppercase" : undefined,
          color: caption.color ?? "#FFFFFF",
          textShadow: `0 ${2 * u}px ${4 * u}px rgba(0,0,0,0.9), 0 0 ${24 * u}px rgba(0,0,0,0.7)`,
          maxWidth: "88%",
          whiteSpace: "pre-line", // "\n" in the text makes a line break
        }}
      >
        {caption.text}
      </div>
    </AbsoluteFill>
  );
};