import { duotone } from "@remotion/effects/duotone";
import { colorKey } from "@remotion/effects/color-key";
import { colorCorrection } from "@remotion/effects/color-correction";
import { contrast } from "@remotion/effects/contrast";
import { exposure } from "@remotion/effects/exposure";
import React from "react";
import {
  AbsoluteFill,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig, interpolateColors, interpolate,
} from "remotion";
import { Video } from "@remotion/media";
import type { FootageClip } from "../types";
import { asset } from "../asset";

/** The dark, desaturated look of the reference. Applied to every clip. */
export const GRADE = "contrast(1.15) saturate(0.7) brightness(0.88)";

/**
 * Plays `clip` starting `at` seconds into the file, filling the frame.
 * Place inside a <Sequence>: the clip starts playing when the sequence starts.
 */
export const ClipVideo: React.FC<{
  clips: Record<string, FootageClip>;
  clip: string;
  at: number;
  style?: React.CSSProperties;
}> = ({ clips, clip, at, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = clips[clip];
  if (!c)
    throw new Error(
      `Unknown clip "${clip}". Add it to the clips list in your script.`,
    );
  return (
    <AbsoluteFill style={{ overflow: "hidden", ...style }}>
      <Video
        src={asset(c.src)}
        trimBefore={Math.round(at * fps)}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: c.objectPosition ?? "50% 50%",
          transform: `scale(${c.zoom ?? 1})`,
          filter: `${GRADE} ${c.filter ?? ""}`,
        }}
        effects={[exposure({
          stops: -2
        }), contrast({}), colorCorrection({
          disabled: true
        }), colorKey({
          similarity: 0.45,
          disabled: true
        }), duotone({
          lightColor: "rgba(221, 56, 56, 1)",
          darkColor: "#2d2a2a",
          threshold: 0.12,
          disabled: true
        })]}
      />
    </AbsoluteFill>
  );
};

/** Film grain + vignette over everything. */
export const FilmLook: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.floor(frame / 2);
  return (
    <>
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile("core/grain.png")})`,
          backgroundSize: "512px 512px",
          backgroundPosition: `${Math.floor(random(`gx-${n}`) * 512)}px ${Math.floor(random(`gy-${n}`) * 512)}px`,
          mixBlendMode: "overlay",
          opacity: 0.14,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </>
  );
};
