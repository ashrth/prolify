import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { clamp } from "../layout";
import type { DreamLayer, DreamScene as DreamData, DreamShot } from "../types";

const smooth = Easing.bezier(0.45, 0, 0.55, 1);

/**
 * A dreamy edit. Every shot is a stack of layers (clips, photos, cutouts) blended together.
 * Shots are back to back; the dreamy transitions happen inside shots (layers appearing, flashes, white-outs).
 */
export const DreamScene: React.FC<{ data: DreamData }> = ({ data }) => {
  const starts: number[] = [];
  data.shots.reduce((t, s) => (starts.push(t), t + s.frames), 0);

  // the look: soft dreamy color, or black and white
  const grade = data.mono
    ? "grayscale(1) contrast(1.2) brightness(1.02)"
    : "saturate(1.08) contrast(0.95) brightness(1.04)";

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ filter: grade }}>
        {data.shots.map((shot, i) => (
          <Sequence
            key={i}
            from={starts[i]}
            durationInFrames={shot.frames}
            premountFor={20}
            name={`${i + 1}. ${describe(shot)}`}
          >
            <ShotView shot={shot} data={data} />
          </Sequence>
        ))}
      </AbsoluteFill>
      <DreamFilm />
    </AbsoluteFill>
  );
};

const describe = (shot: DreamShot) =>
  shot.layers
    .map((l) => l.clip ?? l.cutout ?? l.image?.split("/").pop() ?? "?")
    .join(" + ") || "black";

const ShotView: React.FC<{ shot: DreamShot; data: DreamData }> = ({
  shot,
  data,
}) => {
  const f = useCurrentFrame();

  // gentle handheld shake for the whole shot
  const shake = shot.shake ?? 0;
  const wobble = (k: string) => {
    const t = f / 20;
    const i = Math.floor(t);
    const p = t - i;
    const a = random(`${k}-${i}`) - 0.5;
    const b = random(`${k}-${i + 1}`) - 0.5;
    return a + (b - a) * (p * p * (3 - 2 * p));
  };
  const shakeT = shake
    ? `translate(${wobble("x") * 30 * shake}px, ${wobble("y") * 30 * shake}px) rotate(${wobble("r") * 1.2 * shake}deg) scale(${1 + 0.04 * shake})`
    : undefined;

  // ghost trail: copies of the top video layer, slightly behind in time
  const topVideo = [...shot.layers].reverse().find((l) => l.clip || l.cutout);
  const ghosts: DreamLayer[] =
    shot.echo && topVideo
      ? [1, 2].map((k) => ({
          ...topVideo,
          at: Math.max(0, (topVideo.at ?? 0) - k * 0.12),
          blend: "screen",
          opacity: k === 1 ? 0.4 : 0.22,
        }))
      : [];

  const layers = (
    <>
      {shot.layers.map((l, i) => (
        <LayerView key={i} layer={l} shot={shot} data={data} />
      ))}
      {ghosts.map((l, i) => (
        <LayerView key={`g${i}`} layer={l} shot={shot} data={data} />
      ))}
    </>
  );

  // flashes, fade in, white out
  let overlay: { color: string; opacity: number } | null = null;
  if (shot.fadeIn)
    overlay = {
      color: "#000",
      opacity: interpolate(f, [0, shot.fadeIn], [1, 0], clamp),
    };
  if (shot.flash === "white" && f < 2)
    overlay = { color: "#fff", opacity: f === 0 ? 1 : 0.6 };
  if (shot.flash === "black" && f < 1) overlay = { color: "#000", opacity: 1 };
  if (shot.flash === "white-black" && f < 2)
    overlay = { color: f === 0 ? "#fff" : "#000", opacity: 1 };
  if (shot.whiteOut && f >= shot.frames - shot.whiteOut) {
    overlay = {
      color: "#fff",
      opacity: interpolate(
        f,
        [shot.frames - shot.whiteOut, shot.frames - 1],
        [0, 1],
        { ...clamp, easing: smooth },
      ),
    };
  }

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: shakeT,
          filter: shot.soft ? `blur(${shot.soft}px)` : undefined,
        }}
      >
        {layers}
        {/* bloom: a blurred, brightened copy of the whole shot on top */}
        {shot.glow ? (
          <AbsoluteFill
            style={{
              filter: "blur(28px) brightness(1.25)",
              mixBlendMode: "screen",
              opacity: shot.glow,
            }}
          >
            {layers}
          </AbsoluteFill>
        ) : null}
      </AbsoluteFill>
      {overlay ? (
        <AbsoluteFill
          style={{ background: overlay.color, opacity: overlay.opacity }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

const LayerView: React.FC<{
  layer: DreamLayer;
  shot: DreamShot;
  data: DreamData;
}> = ({ layer, shot, data }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = layer.at ?? 0;
  const rate = layer.rate ?? 1;

  // slow camera move
  const p = interpolate(f, [0, shot.frames], [0, 1], clamp);
  const z = layer.zoom ?? 1;
  const move: Record<NonNullable<DreamLayer["drift"]>, string> = {
    in: `scale(${z * (1 + 0.12 * p)})`,
    out: `scale(${z * (1.12 - 0.12 * p)})`,
    left: `scale(${z * 1.1}) translateX(${3 - 6 * p}%)`,
    right: `scale(${z * 1.1}) translateX(${-3 + 6 * p}%)`,
    up: `scale(${z * 1.1}) translateY(${3 - 6 * p}%)`,
    down: `scale(${z * 1.1}) translateY(${-3 + 6 * p}%)`,
  };
  const transform = layer.drift
    ? move[layer.drift]
    : z !== 1
      ? `scale(${z})`
      : undefined;

  // layer coming in mid-shot
  let opacity = layer.opacity ?? 1;
  let clipPath: string | undefined;
  if (layer.appear) {
    const { at: a, frames, how } = layer.appear;
    const q = interpolate(f, [a, a + frames], [0, 1], {
      ...clamp,
      easing: smooth,
    });
    if (f < a) opacity = 0;
    else if (how === "fade") opacity *= q;
    else if (how === "wipe-down") clipPath = `inset(0 0 ${(1 - q) * 100}% 0)`;
    else if (how === "wipe-right") clipPath = `inset(0 ${(1 - q) * 100}% 0 0)`;
    else if (how === "left-half") clipPath = `inset(0 ${100 - 50 * q}% 0 0)`;
    else if (how === "right-half") clipPath = `inset(0 0 0 ${100 - 50 * q}%)`;
  }

  const fill: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: layer.position ?? "50% 50%",
  };

  let content: React.ReactNode = null;
  if (layer.clip) {
    const clip = data.clips[layer.clip];
    if (!clip)
      throw new Error(
        `Unknown clip "${layer.clip}". Add it to the clips list in your script.`,
      );
    content = (
      <Video
        src={staticFile(clip.src)}
        trimBefore={Math.round(at * fps)}
        playbackRate={rate}
        muted
        style={fill}
      />
    );
  } else if (layer.image) {
    content = <Img src={staticFile(layer.image)} style={fill} />;
  } else if (layer.cutout) {
    const c = data.cutouts?.[layer.cutout];
    if (!c)
      throw new Error(
        `Unknown cutout "${layer.cutout}". Add it to the cutouts list in your script.`,
      );
    // which PNG matches this moment of the original clip
    const n = Math.min(
      c.count,
      Math.max(1, Math.floor((at + (f / fps) * rate) * c.fps) + 1),
    );
    content = (
      <Img
        src={staticFile(`${c.folder}/${String(n).padStart(5, "0")}.png`)}
        style={fill}
      />
    );
  }

  return (
    <AbsoluteFill
      style={{
        transform,
        opacity,
        clipPath,
        mixBlendMode:
          layer.blend && layer.blend !== "normal" ? layer.blend : undefined,
      }}
    >
      {content}
    </AbsoluteFill>
  );
};

/** Faded film: lifted blacks, warm haze, grain, soft vignette. */
const DreamFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.floor(frame / 2);
  return (
    <>
      <AbsoluteFill
        style={{ background: "rgb(24,18,30)", mixBlendMode: "lighten" }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, rgba(255,220,190,0.14), transparent 65%)",
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile("core/grain.png")})`,
          backgroundSize: "512px 512px",
          backgroundPosition: `${Math.floor(random(`dx-${n}`) * 512)}px ${Math.floor(random(`dy-${n}`) * 512)}px`,
          mixBlendMode: "overlay",
          opacity: 0.16,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </>
  );
};
