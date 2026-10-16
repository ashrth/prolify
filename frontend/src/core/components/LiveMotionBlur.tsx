import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";

type Props = {
  src: string;
  kind: "linear" | "zoom" | "spin";
  amount: number; // linear: fraction of width, zoom: extra scale, spin: degrees
  angle?: number; // linear direction in degrees
  center?: { x: number; y: number }; // 0–1, for zoom and spin
  intensity?: number; // 0–1, how much of the blur is mixed over the sharp photo
  samples?: number;
};

/**
 * A real motion blur, the same way the effect works: many copies of the photo,
 * each shifted / scaled / rotated a little, averaged together.
 * Layer k gets opacity 1/(k+1), which makes the stack an exact average.
 */
export const LiveMotionBlur: React.FC<Props> = ({
  src,
  kind,
  amount,
  angle = 0,
  center = { x: 0.5, y: 0.5 },
  intensity = 1,
  samples = 12,
}) => {
  const origin = `${center.x * 100}% ${center.y * 100}%`;
  const imgStyle: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };

  const layers = Array.from({ length: samples }, (_, k) => {
    const t = samples === 1 ? 0 : k / (samples - 1) - 0.5; // -0.5 … 0.5
    let transform = "none";
    if (kind === "linear") {
      transform = `rotate(${angle}deg) translateX(${t * amount * 100}%) rotate(${-angle}deg)`;
    } else if (kind === "zoom") {
      transform = `scale(${1 + (t + 0.5) * amount})`;
    } else {
      transform = `rotate(${t * amount}deg)`;
    }
    return (
      <AbsoluteFill key={k} style={{ opacity: 1 / (k + 1), transform, transformOrigin: kind === "linear" ? "50% 50%" : origin }}>
        <Img src={staticFile(src)} style={imgStyle} />
      </AbsoluteFill>
    );
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <Img src={staticFile(src)} style={imgStyle} />
      <AbsoluteFill style={{ opacity: intensity }}>{layers}</AbsoluteFill>
    </AbsoluteFill>
  );
};
