import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  Sequence,
  staticFile,
  Freeze,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio, Video } from "@remotion/media";
import { asset } from "../../core/asset";
import { themeFilter } from "../../gym/theme";
import type { MirrorContent, MirrorShot } from "./edit";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const settle = Easing.bezier(0.16, 1, 0.3, 1); // fast at first, then gentle: how a focus pull lands
const pull = Easing.bezier(0.4, 0, 0.2, 1); // the focus pull: eases in and out, like a lens ring turning
const drift = Easing.inOut(Easing.sin); // the slow zoom
const isPhoto = (src: string) => /\.(jpe?g|png|webp|avif)$/i.test(src);

export type MirrorProps = { content: MirrorContent };

export const Mirror: React.FC<MirrorProps> = ({ content: c }) => {
  const starts: number[] = [];
  c.shots.reduce((t, s) => (starts.push(t), t + s.frames), 0);
  const look = `${c.grade ?? ""} ${themeFilter(c.theme)}`.trim();

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ filter: look || undefined }}>
        {c.shots.map((shot, i) => (
          <Sequence
            key={i}
            from={starts[i]}
            durationInFrames={shot.frames}
            premountFor={20}
            name={`${i + 1}. ${shot.clip}${shot.note ? ` · ${shot.note}` : ""}`}
          >
            <ShotView shot={shot} index={i} content={c} />
          </Sequence>
        ))}
      </AbsoluteFill>
      <Film grain={c.grain ?? 0.12} vignette={c.vignette ?? 0.4} />
      {c.music ? <Audio src={asset(c.music)} /> : null}
    </AbsoluteFill>
  );
};

const ShotView: React.FC<{
  shot: MirrorShot;
  index: number;
  content: MirrorContent;
}> = ({ shot, index, content }) => {
  const f = useCurrentFrame(); // frame inside this shot
  const { fps, height } = useVideoConfig();
  const u = height / 1920;
  const F = shot.frames;
  const rate = shot.rate ?? 0.6;

  // 1. breathe in: overexposed and washed out for ~6 frames, focus pulls in a little slower (~8 frames)
  const inP = interpolate(f, [0, 6], [0, 1], { ...clamp, easing: settle });
  const focus = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: pull });
  let blur = (1 - focus) * 18 * u;
  // 2. soft again on the way out
  if (shot.blurOut !== false)
    blur += interpolate(f, [F - 3, F - 1], [0, 12 * u], clamp);
  // 3. exposure: starts lifted, settles, then keeps drifting a little darker until the cut
  const brightness =
    (1 + (1 - inP) * 0.5) * interpolate(f, [6, F], [1, 0.93], clamp);
  const contrast = 0.72 + 0.28 * inP;
  // 4. the slow zoom
  const amount = shot.amount ?? 0.1;
  const p = interpolate(f, [0, F], [0, 1], { ...clamp, easing: drift });
  const scale = shot.zoom === "out" ? 1 + amount * (1 - p) : 1 + amount * p;

  const black = Math.max(
    shot.fadeIn ? interpolate(f, [0, shot.fadeIn], [1, 0], clamp) : 0,
    shot.fadeOut ? interpolate(f, [F - shot.fadeOut, F - 1], [0, 1], clamp) : 0,
  );

  const src = content.clips[shot.clip]?.src ?? "";
  const position = shot.position ?? "50% 50%";
  const video = (offset = 0) => {
    const v = (
      <Video
        src={asset(src)}
        trimBefore={Math.round(shot.at * fps) + offset}
        playbackRate={shot.reverse ? 1 : rate}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: position,
        }}
      />
    );
    if (!shot.reverse) return v;
    // backwards: each frame shows an earlier moment of the clip, ending exactly at `at`
    return <Freeze frame={Math.round((F - 1 - f) * rate)}>{v}</Freeze>;
  };
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          transformOrigin: position,
          filter: `blur(${blur}px) brightness(${brightness}) contrast(${contrast})`,
        }}
      >
        {src && isPhoto(src) ? (
          // a photo: same breathing, zoom and grade as the video shots
          <Img
            src={asset(src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: position,
            }}
          />
        ) : src ? (
          <>
            {video()}
            {/* blend: a copy one frame ahead, half see-through, smooths the steps of slow motion */}
            {shot.blend ? (
              <AbsoluteFill style={{ opacity: 0.5 }}>{video(1)}</AbsoluteFill>
            ) : null}
          </>
        ) : (
          <Placeholder
            index={index}
            shot={shot}
            note={shot.note ?? content.clips[shot.clip]?.note}
          />
        )}
      </AbsoluteFill>
      {black > 0 ? (
        <AbsoluteFill style={{ background: "#000", opacity: black }} />
      ) : null}
    </AbsoluteFill>
  );
};

/** Shown until a clip is filled in, so the timing can be previewed already. */
const Placeholder: React.FC<{
  index: number;
  shot: MirrorShot;
  note?: string;
}> = ({ index, shot, note }) => {
  const { height } = useVideoConfig();
  const u = height / 1920;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, hsl(${20 + index * 23}, 22%, 34%), hsl(${200 + index * 11}, 18%, 14%))`,
        justifyContent: "center",
        alignItems: "center",
        color: "#f3ece4",
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
        gap: 18 * u,
      }}
    >
      <div style={{ fontSize: 120 * u, fontWeight: 700 }}>{index + 1}</div>
      <div style={{ fontSize: 46 * u }}>{shot.clip}</div>
      {note ? (
        <div style={{ fontSize: 34 * u, opacity: 0.7, maxWidth: "80%" }}>
          {note}
        </div>
      ) : null}
      <div style={{ fontSize: 30 * u, opacity: 0.55 }}>
        from {shot.at}s · {(shot.rate ?? 0.6).toFixed(2)}x · zoom{" "}
        {shot.zoom ?? "in"}
      </div>
    </AbsoluteFill>
  );
};

/** Grain and vignette over everything. */
const Film: React.FC<{ grain: number; vignette: number }> = ({
  grain,
  vignette,
}) => {
  const frame = useCurrentFrame();
  const n = Math.floor(frame / 2);
  return (
    <>
      {grain > 0 ? (
        <AbsoluteFill
          style={{
            backgroundImage: `url(${staticFile("core/grain.png")})`,
            backgroundSize: "512px 512px",
            backgroundPosition: `${Math.floor(random(`mx-${n}`) * 512)}px ${Math.floor(random(`my-${n}`) * 512)}px`,
            mixBlendMode: "overlay",
            opacity: grain,
          }}
        />
      ) : null}
      {vignette > 0 ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,${vignette}) 100%)`,
          }}
        />
      ) : null}
    </>
  );
};
