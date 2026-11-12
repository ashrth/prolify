import React, { useEffect } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  prefetch,
  Sequence,
  getRemotionEnvironment,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ClipVideo, FilmLook } from "../components/Footage";
import { fonts } from "../fonts";
import { clamp } from "../layout";
import { asset } from "../asset";

import type { TextBehindScene as TextBehindData } from "../types";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * Layers, bottom to top:
 *   1. the base clip
 *   2. a horizontal band (dark, then flashing other clips) with the big text inside it
 *   3. the cutout of the person (same clip, background removed), so the text sits behind her
 * Without a cutout, the text simply sits in front.
 */
export const TextBehindScene: React.FC<{ data: TextBehindData }> = ({
  data,
}) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const u = height / 1080;
  const { band } = data;

  // load every cutout frame up front, so the preview doesn't stall fetching one per frame
  useEffect(() => {
    if (!data.cutout || getRemotionEnvironment().isRendering) return; // preview only
    const { folder, count } = data.cutout;
    const loads = Array.from({ length: count }, (_, i) =>
      prefetch(asset(`${folder}/${String(i + 1).padStart(4, "0")}.png`)),
    );
    return () => loads.forEach((l) => l.free());
  }, [data.cutout]);

  const [h1, h2] = band.heights;
  const bandH =
    interpolate(frame, [band.openAt, band.openAt + 14], [0, h1], {
      ...clamp,
      easing: ease,
    }) +
    interpolate(frame, [band.growAt, band.growAt + 14], [0, h2 - h1], {
      ...clamp,
      easing: ease,
    });
  const showBand = frame >= band.openAt && frame < band.hideAt;
  const bandTop = band.centerY * height - (bandH * u) / 2;

  const fadeIn = interpolate(frame, [0, 4], [1, 0], clamp);
  const isSilhouette =
    data.silhouetteAt !== undefined &&
    frame >= data.silhouetteAt &&
    frame < data.silhouetteAt + 2;
  const cutoutFrame = data.cutout ? Math.min(frame, data.cutout.count - 1) : 0;
  // same framing for the base clip and the cutout, so they stay perfectly aligned
  const framing: React.CSSProperties = {
    transform: `scale(${data.base.scale ?? 1}) translateX(${data.base.shiftX ?? 0}%)`,
    transformOrigin: "50% 50%",
  };
  const cutoutSrc = data.cutout
    ? asset(
        `${data.cutout.folder}/${String(cutoutFrame + 1).padStart(4, "0")}.png`,
      )
    : null;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* 1. base clip */}
      <ClipVideo
        clips={data.clips}
        clip={data.base.clip}
        at={data.base.at}
        style={framing}
      />

      {/* 2. band with flashing clips + text */}
      {showBand ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: bandTop,
            height: bandH * u,
            overflow: "hidden",
            background: "rgba(0,0,0,0.72)",
          }}
        >
          {/* clips inside the band are positioned as if full-frame, so the band is a window onto them */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: -bandTop,
              height,
            }}
          >
            {data.flashes.map((f, i) => (
              <Sequence
                key={i}
                from={data.flashFrom + i * data.flashEvery}
                durationInFrames={data.flashEvery}
                premountFor={10}
              >
                <ClipVideo clips={data.clips} clip={f.clip} at={f.at} />
              </Sequence>
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              textAlign: "center",
              fontFamily: fonts.anton,
              fontSize: data.textSize * u,
              lineHeight: 1,
              color: data.color,
              whiteSpace: "nowrap",
            }}
          >
            {data.text}
          </div>
        </div>
      ) : null}

      {/* 3. the person on top of the text */}
      {cutoutSrc && showBand ? (
        <AbsoluteFill style={framing}>
          <Img
            src={cutoutSrc}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
      ) : null}

      {/* white silhouette flash: the cutout as solid white over a darkened frame (or a high-contrast flash without a cutout) */}
      {isSilhouette ? (
        cutoutSrc ? (
          <>
            <AbsoluteFill style={{ background: "rgba(0,0,0,0.55)" }} />
            <AbsoluteFill style={framing}>
              <Img
                src={cutoutSrc}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "brightness(0) invert(1)",
                }}
              />
            </AbsoluteFill>
          </>
        ) : (
          <AbsoluteFill
            style={{
              backdropFilter: "grayscale(1) contrast(7) brightness(2.4)",
            }}
          />
        )
      ) : null}

      <FilmLook />
      <AbsoluteFill style={{ background: "#000", opacity: fadeIn }} />
    </AbsoluteFill>
  );
};
