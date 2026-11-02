import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { FilmLook } from "../components/Footage";
import { fonts } from "../fonts";
import { clamp } from "../layout";
import type {
  DialogueBackdrop,
  DialogueLine,
  DialogueScene as DialogueData,
  DialogueShot,
  FootageClip,
} from "../types";

const out = Easing.bezier(0.16, 1, 0.3, 1);

// The two looks. Text is never graded, so it stays blood red in both.
const THEME = {
  bw: "grayscale(1) contrast(1.5) brightness(0.62)",
  color: "saturate(1.7) contrast(1.15) brightness(1.02)", // boosts every color: whites, blues, greens, yellows, reds
};
// Blood-red grade for `red: true` shots, in either theme
const RED =
  "grayscale(1) contrast(1.45) brightness(0.9) sepia(1) hue-rotate(-40deg) saturate(6)";

export const DialogueScene: React.FC<{ data: DialogueData }> = ({ data }) => {
  const starts: number[] = [];
  data.shots.reduce((t, s) => (starts.push(t), t + s.frames), data.cutsFrom);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {data.backdrops.map((b, i) => (
        <Sequence
          key={`b${i}`}
          from={b.from}
          durationInFrames={b.to - b.from}
          premountFor={20}
          name={`backdrop: ${b.clip}`}
        >
          <Backdrop b={b} data={data} />
        </Sequence>
      ))}
      {data.shots.map((s, i) => (
        <Sequence
          key={`s${i}`}
          from={starts[i]}
          durationInFrames={s.frames}
          premountFor={20}
          name={`${i + 1}. ${s.clip} @${s.at}s`}
        >
          <ShotView shot={s} data={data} />
        </Sequence>
      ))}
      <FilmLook />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      {data.lines.map((l, i) => (
        <Sequence
          key={`t${i}`}
          from={l.at}
          durationInFrames={l.until - l.at}
          name={`"${l.text}"`}
        >
          <Line line={l} color={data.textColor} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const Clip: React.FC<{
  clips: Record<string, FootageClip>;
  clip: string;
  at: number;
  rate?: number;
  style?: React.CSSProperties;
}> = ({ clips, clip, at, rate, style }) => {
  const { fps } = useVideoConfig();
  const c = clips[clip];
  if (!c)
    throw new Error(
      `Unknown clip "${clip}". Add it to the clips list in your script.`,
    );
  return (
    <Video
      src={staticFile(c.src)}
      trimBefore={Math.round(at * fps)}
      playbackRate={rate ?? 1}
      muted
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        ...style,
      }}
    />
  );
};

/** Full-screen clip behind the final words: slow push-in, a punch on the big word, then a whip into the cuts. */
const Backdrop: React.FC<{ b: DialogueBackdrop; data: DialogueData }> = ({
  b,
  data,
}) => {
  const f = useCurrentFrame();
  const len = b.to - b.from;
  const [z0, z1] = b.zoom ?? [1.1, 1.6];
  let scale = interpolate(f, [0, len], [z0, z1], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });
  let shake = "";
  if (b.punchAt !== undefined) {
    const p = f - (b.punchAt - b.from);
    if (p >= 0) {
      scale *= interpolate(p, [0, 5], [1.18, 1], { ...clamp, easing: out });
      const s = interpolate(p, [0, 10], [1, 0], clamp);
      shake = ` translate(${(random(`sx${f}`) - 0.5) * 40 * s}px, ${(random(`sy${f}`) - 0.5) * 40 * s}px)`;
    }
  }
  let whip = "";
  let blur = 0;
  if (b.whipOut) {
    const p = interpolate(f, [len - b.whipOut, len], [0, 1], clamp);
    whip = ` translateX(${p * 22}%)`;
    blur = p * 30;
  }
  const grade = THEME[data.theme];
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: b.opacity ?? 1 }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale})${shake}${whip}`,
          transformOrigin: b.origin ?? "50% 40%",
          filter: `${grade} blur(${blur + (b.blur ?? 0)}px)`,
        }}
      >
        <Clip
          clips={data.clips}
          clip={b.clip}
          at={b.at}
          rate={b.rate}
          style={{ objectPosition: b.position ?? "50% 50%" }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.35)" }} />
    </AbsoluteFill>
  );
};

const ShotView: React.FC<{ shot: DialogueShot; data: DialogueData }> = ({
  shot,
  data,
}) => {
  const f = useCurrentFrame();
  const grade = shot.red ? RED : THEME[data.theme];

  let transform = "";
  let blur = 0;
  if (shot.punch)
    transform += ` scale(${interpolate(f, [0, 6], [1.2, 1], { ...clamp, easing: out })})`;
  if (shot.whip) {
    const p = interpolate(f, [0, 5], [0, 1], { ...clamp, easing: out });
    transform += ` translateX(${(1 - p) * -25}%)`;
    blur = (1 - p) * 26;
  }
  const fill = shot.fill ?? "cover";

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {fill === "blur" ? (
        <>
          {/* the reference look: a blurred, darkened copy fills the screen, the whole 16:9 frame sits in the middle */}
          <AbsoluteFill
            style={{
              filter: `${grade} blur(40px) brightness(0.45)`,
              transform: "scale(1.2)",
            }}
          >
            <Clip
              clips={data.clips}
              clip={shot.clip}
              at={shot.at}
              rate={shot.rate}
            />
          </AbsoluteFill>
          <AbsoluteFill
            style={{
              transform: transform || undefined,
              filter: `${grade} blur(${blur}px)`,
            }}
          >
            <Clip
              clips={data.clips}
              clip={shot.clip}
              at={shot.at}
              rate={shot.rate}
              style={{ objectFit: "contain" }}
            />
          </AbsoluteFill>
        </>
      ) : (
        <AbsoluteFill
          style={{
            transform: transform || undefined,
            filter: `${grade} blur(${blur}px)`,
          }}
        >
          <Clip
            clips={data.clips}
            clip={shot.clip}
            at={shot.at}
            rate={shot.rate}
            style={{ objectPosition: shot.position ?? "50% 50%" }}
          />
        </AbsoluteFill>
      )}
      {shot.red ? (
        <AbsoluteFill
          style={{ background: "rgba(150,0,0,0.25)", mixBlendMode: "multiply" }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/** A line of dialogue: pops in, centered. The big one slams in with a black outline and shakes. */
const Line: React.FC<{ line: DialogueLine; color: string }> = ({
  line,
  color,
}) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  const big = line.big;
  const scale = big
    ? interpolate(f, [0, 4], [2.2, 1], { ...clamp, easing: out })
    : interpolate(f, [0, 3], [1.12, 1], clamp);
  const s = big ? interpolate(f, [0, 12], [1, 0.25], clamp) : 0;
  const shake = big
    ? `translate(${(random(`kx${f}`) - 0.5) * 24 * s}px, ${(random(`ky${f}`) - 0.5) * 24 * s}px)`
    : "";
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 60 * u,
      }}
    >
      <div
        style={{
          fontFamily: fonts.anton,
          fontSize: (big ? 200 : 66) * u,
          lineHeight: 1.1,
          textAlign: "center",
          color,
          transform: `scale(${scale}) ${shake}`,
          opacity: interpolate(f, [0, 2], [0, 1], clamp),
          WebkitTextStroke: big ? `${5 * u}px #000` : undefined,
          paintOrder: "stroke fill",
          textShadow: big
            ? `0 0 ${30 * u}px rgba(160,0,0,0.6)`
            : `0 0 ${3 * u}px #000, 0 0 ${16 * u}px rgba(0,0,0,0.9)`,
        }}
      >
        {line.text}
      </div>
    </AbsoluteFill>
  );
};
