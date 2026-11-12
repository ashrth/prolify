import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { ClipVideo, FilmLook } from "../components/Footage";
import { clamp } from "../layout";
import type { FootageClip, FootageCutsScene as CutsData, Shot } from "../types";
import { colorCorrection } from "@remotion/effects/color-correction";
import { colorFxAt } from "../keyframes";

const out = Easing.bezier(0.16, 1, 0.3, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);

// How many frames each entrance takes. During that time the previous shot keeps playing underneath/on top.
const T: Record<NonNullable<Shot["enter"]>, number> = {
  cut: 0,
  slices: 10,
  shrink: 10,
  letterbox: 0,
  diagonal: 6,
};
const SLICES = 8;

/**
 * A run of shots, back to back. Each shot can enter with a transition and carry "looks"
 * (punch, push, whip, white flash, glitch, blur out). See the Shot type for all options.
 */
export const FootageCutsScene: React.FC<{ data: CutsData }> = ({ data }) => {
  // start frame of every shot
  const starts: number[] = [];
  data.shots.reduce((t, s) => (starts.push(t), t + s.frames), 0);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {data.shots.map((shot, i) => {
        const next = data.shots[i + 1];
        const overlap = next ? T[next.enter ?? "cut"] : 0; // keep playing while the next shot transitions in
        const onTop = next?.enter === "shrink"; // a shrinking shot sits above the next one
        return (
          <Sequence
            key={i}
            from={starts[i]}
            durationInFrames={shot.frames + overlap}
            premountFor={15}
            name={`${i + 1}. ${shot.clip} @${shot.at}s`}
            style={{ zIndex: onTop ? 1000 : i }}
          >
            <ShotView
              shot={shot}
              clips={data.clips}
              exitFrames={overlap}
              exit={next?.enter}
            />
          </Sequence>
        );
      })}
      <FilmLook />
    </AbsoluteFill>
  );
};

/** The effects active on this frame of the shot: the color adjustments, plus any timed effects in range. */
const effectsAt = (shot: Shot, f: number) => {
  const list = [
    ...(shot.fx ? [colorCorrection(colorFxAt(shot.fx, f))] : []),
    ...(shot.timed ?? [])
      .filter((t) => f >= t.from && f <= t.to)
      .map((t) => t.effect),
  ];
  return list.length ? list : undefined;
};

const ShotView: React.FC<{
  shot: Shot;
  clips: Record<string, FootageClip>;
  exitFrames: number;
  exit?: Shot["enter"];
}> = ({ shot, clips, exitFrames, exit }) => {
  const f = useCurrentFrame(); // frame inside this shot
  const enter = shot.enter ?? "cut";
  const t = T[enter];

  // ---- looks on the clip itself ----
  let transform = "";
  let filter = "";
  let opacity = 1;
  if (shot.punch)
    transform += ` scale(${interpolate(f, [0, 7], [1.18, 1], { ...clamp, easing: out })})`;
  if (shot.push)
    transform += ` scale(${interpolate(f, [0, shot.frames], [1, 1.08], clamp)})`;
  if (shot.whip) {
    const p = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: out });
    transform += ` translateX(${(1 - p) * -35}%) scaleX(${1.15 - 0.15 * p})`;
    filter += ` blur(${(1 - p) * 26}px)`;
  }
  if (shot.white && f >= shot.white[0] && f < shot.white[1])
    filter += " grayscale(1) contrast(7) brightness(2.4)";
  let black = false;
  if (shot.glitch && f >= shot.glitch[0] && f < shot.glitch[1]) {
    const k = (f - shot.glitch[0]) % 4;
    if (k === 1) black = true;
    if (k === 2) {
      // vertical smear: stretch a thin slice of the frame, tint it teal
      transform += ` scaleY(${4 + random(`s-${f}`) * 6})`;
      filter +=
        " blur(1.5px) grayscale(1) sepia(1) hue-rotate(130deg) saturate(3) brightness(0.8)";
    }
  }
  if (shot.blurOut) {
    const p = interpolate(
      f,
      [shot.frames - shot.blurOut, shot.frames],
      [0, 1],
      clamp,
    );
    filter += ` blur(${p * 28}px) brightness(${1 - p})`;
  }

  // ---- how this shot exits (only "shrink" changes the outgoing shot) ----
  if (exit === "shrink" && f >= shot.frames) {
    const p = interpolate(f, [shot.frames, shot.frames + exitFrames], [0, 1], {
      ...clamp,
      easing: inOut,
    });
    transform = ` translate(${p * 24}%, ${p * -20}%) scale(${1 - p * 0.6})`;
    opacity = f >= shot.frames + exitFrames - 1 ? 0 : 1;
  }

  // ---- how this shot enters ----
  let clipPath: string | undefined;
  if (enter === "slices" && f < t) {
    // horizontal bands wipe in left to right, one after another
    const h = 100 / SLICES;
    const pts: string[] = [];
    for (let i = 0; i < SLICES; i++) {
      const p = interpolate(f, [i * 0.7, i * 0.7 + 5], [0, 100], {
        ...clamp,
        easing: out,
      });
      pts.push(
        `0% ${i * h}%`,
        `${p}% ${i * h}%`,
        `${p}% ${(i + 1) * h}%`,
        `0% ${(i + 1) * h}%`,
      );
    }
    clipPath = `polygon(${pts.join(", ")})`;
  }
  if (enter === "letterbox") {
    const inset = interpolate(f, [0, shot.frames], [46, 34], {
      ...clamp,
      easing: out,
    });
    clipPath = `inset(${inset}% 0 ${inset}% 0)`;
  }

  const style: React.CSSProperties = {
    transform: transform || undefined,
    filter: filter || undefined,
    opacity,
    clipPath,
    transformOrigin: "50% 50%",
  };

  return (
    <AbsoluteFill
      style={{ background: enter === "letterbox" ? "#000" : undefined }}
    >
      <ClipVideo
        clips={clips}
        clip={shot.clip}
        at={shot.at}
        style={style}
        effects={effectsAt(shot, f)}
      />
      {black ? <AbsoluteFill style={{ background: "#000" }} /> : null}

      {/* inverted strips riding the slice edges */}
      {enter === "slices" && f < t
        ? Array.from({ length: SLICES }, (_, i) => {
            const p = interpolate(f, [i * 0.7, i * 0.7 + 5], [0, 100], {
              ...clamp,
              easing: out,
            });
            if (p <= 0 || p >= 100) return null;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${p}%`,
                  width: `${18 * (1 - p / 100)}%`,
                  top: `${(i * 100) / SLICES}%`,
                  height: `${100 / SLICES}%`,
                  background: "#fff",
                  mixBlendMode: "difference",
                }}
              />
            );
          })
        : null}

      {/* diagonal split: a second clip slides in on the right */}
      {enter === "diagonal" && shot.split ? (
        <ClipVideo
          clips={clips}
          clip={shot.split.clip}
          at={shot.split.at}
          style={{
            clipPath: (() => {
              const s = interpolate(f, [0, t], [50, 0], {
                ...clamp,
                easing: out,
              });
              return `polygon(${58 + s}% 0, 100% 0, 100% 100%, ${42 + s}% 100%)`;
            })(),
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
