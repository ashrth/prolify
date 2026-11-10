import React from "react";
import { AbsoluteFill, Img, interpolate, random, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { clamp } from "../layout";
import { compFonts } from "./fonts";
import type { CompLayer, CompositeScene as CompData, CompShot } from "./types";

type ClipL = Extract<CompLayer, { kind: "clip" }>;
type CutL = Extract<CompLayer, { kind: "cutout" }>;
type TextL = Extract<CompLayer, { kind: "text" }>;
type CircleL = Extract<CompLayer, { kind: "circle" }>;
type ScribbleL = Extract<CompLayer, { kind: "scribble" }>;

/** Shots back to back, each a stack of layers. */
export const CompositeSceneView: React.FC<{ data: CompData }> = ({ data }) => {
  const starts: number[] = [];
  data.shots.reduce((t, s) => (starts.push(t), t + s.frames), 0);
  const grade = data.mono ? "grayscale(1) contrast(1.05) brightness(1.03)" : undefined;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ filter: grade }}>
        {data.shots.map((shot, i) => (
          <Sequence key={i} from={starts[i]} durationInFrames={shot.frames} premountFor={20} name={`${i + 1}. ${describe(shot)}`}>
            <ShotView shot={shot} data={data} />
          </Sequence>
        ))}
      </AbsoluteFill>
      <Film />
    </AbsoluteFill>
  );
};

const describe = (s: CompShot) =>
  s.layers.map((l) => (l.kind === "clip" ? l.clip : l.kind === "cutout" ? `cutout:${l.cutout}` : l.kind)).join(" + ") || "black";

const ShotView: React.FC<{ shot: CompShot; data: CompData }> = ({ shot, data }) => {
  const f = useCurrentFrame();

  let filter: string | undefined;
  if (shot.flash === "invert" && f === 0) filter = "invert(1)";
  if (shot.bright && f >= shot.bright[0] && f < shot.bright[1]) {
    const p = interpolate(f, [shot.bright[0], shot.bright[0] + 3], [0, 1], clamp);
    filter = `brightness(${1 + 0.9 * p}) contrast(${1 - 0.2 * p})`;
  }
  const white =
    shot.flash === "white" && f === 0
      ? 1
      : shot.whiteOut && f >= shot.frames - shot.whiteOut
        ? interpolate(f, [shot.frames - shot.whiteOut, shot.frames - 1], [0, 1], clamp)
        : 0;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ filter }}>
        {shot.layers.map((l, i) => {
          if ((l.appear !== undefined && f < l.appear) || (l.until !== undefined && f >= l.until)) return null;
          switch (l.kind) {
            case "clip":
              return <ClipLayer key={i} l={l} shot={shot} data={data} />;
            case "cutout":
              return <CutoutLayer key={i} l={l} data={data} />;
            case "text":
              return <TextLayer key={i} l={l} />;
            case "circle":
              return <CircleLayer key={i} l={l} />;
            case "scribble":
              return <ScribbleLayer key={i} l={l} />;
          }
        })}
      </AbsoluteFill>
      {white > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: white }} /> : null}
    </AbsoluteFill>
  );
};

const ClipLayer: React.FC<{ l: ClipL; shot: CompShot; data: CompData }> = ({ l, shot, data }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clip = data.clips[l.clip];
  if (!clip) throw new Error(`Unknown clip "${l.clip}". Add it to the clips list in your script.`);
  const position = l.position ?? "50% 50%";
  const zoom = (l.zoom ?? 1) * (1 + (l.drift ?? 0) * (f / shot.frames));
  const video = (
    <Video
      src={staticFile(clip.src)}
      trimBefore={Math.round(l.at * fps)}
      playbackRate={l.rate ?? 1}
      muted
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: position, transform: `scale(${zoom})`, transformOrigin: position }}
    />
  );
  const wrap: React.CSSProperties = {
    opacity: l.opacity ?? 1,
    mixBlendMode: l.blend && l.blend !== "normal" ? l.blend : undefined,
    filter: l.soft ? `blur(${l.soft}px)` : undefined,
  };

  if (!l.spin) return <AbsoluteFill style={wrap}>{video}</AbsoluteFill>;

  // spinning blur: copies of the clip rotated a little each way, averaged (layer k at opacity 1/(k+1))
  const N = 5;
  const spin = l.spin;
  const turn = interpolate(f, [0, shot.frames], [0, spin * 0.6]);
  return (
    <AbsoluteFill style={wrap}>
      {Array.from({ length: N }, (_, k) => (
        <AbsoluteFill key={k} style={{ opacity: 1 / (k + 1), transform: `rotate(${turn + (k / (N - 1) - 0.5) * spin}deg) scale(1.25)` }}>
          {video}
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

const CutoutLayer: React.FC<{ l: CutL; data: CompData }> = ({ l, data }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = data.cutouts?.[l.cutout];
  if (!c) throw new Error(`Unknown cutout "${l.cutout}". Add it to the cutouts list in your script.`);
  // which PNG matches this moment of the source clip
  const n = Math.min(c.count, Math.max(1, Math.floor((l.at - c.start + (f / fps) * (l.rate ?? 1)) * c.fps) + 1));
  const position = l.position ?? "50% 50%";
  const isWhite = l.white && f >= l.white[0] && f < l.white[1];
  const filter = isWhite ? "brightness(0) invert(1)" : l.dark ? "brightness(0.15)" : undefined;

  return (
    <AbsoluteFill
      style={{
        opacity: l.opacity ?? 1,
        transform: `translate(${l.x ?? 0}%, ${l.y ?? 0}%) scale(${l.mirror ? -(l.scale ?? 1) : l.scale ?? 1}, ${l.scale ?? 1})`,
        transformOrigin: "50% 100%",
      }}
    >
      <Img
        src={staticFile(`${c.folder}/${String(n).padStart(4, "0")}.png`)}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: position, transform: `scale(${l.zoom ?? 1})`, transformOrigin: position, filter }}
      />
    </AbsoluteFill>
  );
};

const TextLayer: React.FC<{ l: TextL }> = ({ l }) => {
  const { height } = useVideoConfig();
  const spacing = l.spacing ?? "0.4em";
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: l.opacity ?? 0.35, transform: `translateX(${l.x ?? 0}%)` }}>
      <div
        style={{
          fontFamily: compFonts.serif,
          fontWeight: 300,
          fontSize: l.size * height,
          lineHeight: 1,
          letterSpacing: spacing,
          marginRight: `-${spacing}`, // letter spacing adds space after the last letter; this re-centers it
          color: l.color ?? "#fff",
          whiteSpace: "nowrap",
        }}
      >
        {l.text}
      </div>
    </AbsoluteFill>
  );
};

const CircleLayer: React.FC<{ l: CircleL }> = ({ l }) => {
  const { width, height } = useVideoConfig();
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: l.opacity ?? 0.9 }}>
      <circle cx={(l.x / 100) * width} cy={(l.y / 100) * height} r={(l.r / 100) * height} fill="none" stroke="#fff" strokeWidth={height * 0.003} />
    </svg>
  );
};

const ScribbleLayer: React.FC<{ l: ScribbleL }> = ({ l }) => {
  const { width, height } = useVideoConfig();
  const x = (l.x / 100) * width;
  const y = (l.y / 100) * height;
  const s = height / 1080;
  return (
    <AbsoluteFill style={{ opacity: l.opacity ?? 0.9 }}>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          fontFamily: compFonts.hand,
          fontSize: 64 * s,
          color: "#fff",
          transform: "rotate(-8deg)",
          transformOrigin: "left center",
          whiteSpace: "nowrap",
        }}
      >
        {l.text}
      </div>
      {/* doodle lines: an underline flick and a hooked arrow */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }} fill="none" stroke="#fff" strokeWidth={2.5 * s} strokeLinecap="round">
        <path d={`M ${x} ${y + 85 * s} q ${120 * s} ${-20 * s} ${230 * s} ${-35 * s}`} />
        <path d={`M ${x + 40 * s} ${y + 330 * s} q ${40 * s} ${-60 * s} ${110 * s} ${-90 * s} m 0 0 l ${-28 * s} ${-2 * s} m ${28 * s} ${2 * s} l ${-8 * s} ${26 * s}`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Misty film: lifted blacks, a soft haze, grain and a vignette. */
const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.floor(frame / 2);
  return (
    <>
      <AbsoluteFill style={{ background: "rgb(22,22,22)", mixBlendMode: "lighten" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.08), transparent 65%)", mixBlendMode: "screen" }} />
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile("core/grain.png")})`,
          backgroundSize: "512px 512px",
          backgroundPosition: `${Math.floor(random(`cx-${n}`) * 512)}px ${Math.floor(random(`cy-${n}`) * 512)}px`,
          mixBlendMode: "overlay",
          opacity: 0.14,
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.45) 100%)" }} />
    </>
  );
};
