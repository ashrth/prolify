import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Backdrop } from "../components/Backdrop";
import { clamp, useLayout } from "../layout";
import { enterStyle, outExpo } from "../presets";
import type {
  Brand,
  FeatureScene as FeatureData,
  FeatureVisual,
} from "../types";

const cover: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

/** Big headline on top, one visual that proves it underneath. */
export const FeatureScene: React.FC<{ data: FeatureData; brand: Brand }> = ({
  data,
  brand,
}) => {
  const frame = useCurrentFrame();
  const { u, fps, isVertical } = useLayout();

  return (
    <AbsoluteFill>
      <Backdrop brand={brand} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: isVertical ? "flex-start" : "center",
          paddingTop: (isVertical ? 170 : 60) * u,
          gap: 60 * u,
        }}
      >
        <AnimatedText
          text={data.headline}
          preset="mask-up"
          stagger={3}
          style={{
            fontSize: 120 * u,
            fontWeight: 700,
            lineHeight: 1,
            color: brand.colors.text,
            textAlign: "center",
          }}
        />
        <div style={enterStyle("rise", frame - 2, fps, u)}>
          <Visual visual={data.visual} duration={data.duration} brand={brand} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Frame: React.FC<{ w: number; h: number; children: React.ReactNode }> = ({
  w,
  h,
  children,
}) => {
  const { u } = useLayout();
  return (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        borderRadius: 30 * u,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: `0 ${40 * u}px ${120 * u}px rgba(0,0,0,0.6)`,
      }}
    >
      {children}
    </div>
  );
};

/** Fit an image of `aspect` inside the visual area. */
const useBox = (aspect: number) => {
  const { u, isVertical } = useLayout();
  const maxW = (isVertical ? 880 : 1100) * u;
  const maxH = (isVertical ? 1150 : 760) * u;
  const w = Math.min(maxW, maxH * aspect);
  return { w, h: w / aspect };
};

const Visual: React.FC<{
  visual: FeatureVisual;
  duration: number;
  brand: Brand;
}> = ({ visual, duration, brand }) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const box = useBox(visual.kind === "flip" ? 1 : visual.aspect);

  switch (visual.kind) {
    case "flip": {
      const i = Math.floor(frame / visual.framesPer) % visual.images.length;
      const local = frame % visual.framesPer;
      const punch = interpolate(local, [0, visual.framesPer], [1.06, 1], clamp);
      return (
        <Frame w={box.w * 0.85} h={box.w * 0.85}>
          <Img
            src={staticFile(visual.images[i])}
            style={{ ...cover, transform: `scale(${punch})` }}
          />
        </Frame>
      );
    }

    case "image": {
      const zoom = interpolate(frame, [0, duration], [1, 1.08], clamp);
      return (
        <Frame w={box.w} h={box.h}>
          <Img
            src={staticFile(visual.image)}
            style={{ ...cover, transform: `scale(${zoom})` }}
          />
        </Frame>
      );
    }

    case "watermark": {
      // start zoomed into the bottom-right corner, pull back once the watermark is gone
      const zoom = interpolate(
        frame,
        [visual.removeAt + 4, visual.removeAt + 18],
        [2.4, 1],
        {
          ...clamp,
          easing: Easing.inOut(Easing.cubic),
        },
      );
      const strike = interpolate(
        frame,
        [visual.strikeAt, visual.strikeAt + 6],
        [0, 1],
        { ...clamp, easing: outExpo },
      );
      const gone = interpolate(
        frame,
        [visual.removeAt, visual.removeAt + 8],
        [0, 1],
        clamp,
      );
      return (
        <Frame w={box.w} h={box.h}>
          <AbsoluteFill
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "100% 100%",
            }}
          >
            <Img src={staticFile(visual.image)} style={cover} />
            {/* the watermark, drawn in code so it can be animated off */}
            <div
              style={{
                position: "absolute",
                right: "2.2%",
                bottom: "1.8%",
                fontSize: box.w * 0.022,
                fontWeight: 600,
                color: "rgba(255,255,255,0.82)",
                opacity: 1 - gone,
                filter: `blur(${gone * 6 * u}px)`,
                transform: `scale(${1 + gone * 0.2})`,
                whiteSpace: "nowrap",
              }}
            >
              {visual.text}
              <div
                style={{
                  position: "absolute",
                  left: "-4%",
                  right: "-4%",
                  top: "50%",
                  height: Math.max(2, box.w * 0.003),
                  background: brand.colors.text,
                  transform: `scaleX(${strike})`,
                  transformOrigin: "left center",
                }}
              />
            </div>
          </AbsoluteFill>
        </Frame>
      );
    }

    case "steps": {
      const last = visual.steps.length - 1;
      const i = Math.min(Math.floor(frame / visual.framesPer), last);
      const local = frame - i * visual.framesPer;
      const isLast = i === last;
      const flash = i > 0 ? interpolate(local, [0, 4], [0.25, 0], clamp) : 0;
      const labelScale = isLast
        ? interpolate(local, [0, 8], [1.4, 1], { ...clamp, easing: outExpo })
        : 1;
      return (
        <Frame w={box.w} h={box.h}>
          <Img src={staticFile(visual.steps[i].image)} style={cover} />
          <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
          <div
            style={{
              position: "absolute",
              left: 40 * u,
              bottom: 36 * u,
              padding: `${10 * u}px ${26 * u}px`,
              borderRadius: 999,
              background: isLast ? "#fff" : "rgba(0,0,0,0.6)",
              color: isLast ? "#05050A" : "#fff",
              fontSize: 54 * u,
              fontWeight: 700,
              transform: `scale(${labelScale})`,
              transformOrigin: "left bottom",
            }}
          >
            {visual.steps[i].label}
          </div>
        </Frame>
      );
    }
  }
};
