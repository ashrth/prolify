import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Backdrop } from "../components/Backdrop";
import { ControlPanel } from "../components/ControlPanel";
import { sliderValue } from "../components/SettingsPanel";
import { clamp, useLayout } from "../layout";
import { enterStyle, outExpo } from "../presets";
import type { Brand, ControlSection, PanelSlider } from "../types";
import { captionFonts } from "./fonts";
import { CARD, DEFAULT_LOOK, LookPhoto, PolaroidCard } from "./PolaroidCard";
import type { FrameName, PileCard, PolaroidCaption, PolaroidFrames, PolaroidHook, PolaroidLook, PolaroidPile, PolaroidSceneData, PolaroidTune } from "./types";

const cover: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };
const FRAME_ORDER: FrameName[] = ["cream", "white", "black"];

export const PolaroidSceneView: React.FC<{ data: PolaroidSceneData; brand: Brand }> = ({ data, brand }) => {
  switch (data.mode) {
    case "hook":
      return <Hook d={data} brand={brand} />;
    case "tune":
      return <Tune d={data} brand={brand} />;
    case "frames":
      return <Frames d={data} brand={brand} />;
    case "caption":
      return <Caption d={data} brand={brand} />;
    case "pile":
      return <Pile d={data} brand={brand} />;
  }
};

// ─── shared pieces ──────────────────────────────────────────

const Headline: React.FC<{ text: string; brand: Brand; size?: number }> = ({ text, brand, size = 92 }) => {
  const { u } = useLayout();
  return (
    <AnimatedText
      text={text}
      preset="mask-up"
      stagger={3}
      style={{ fontSize: size * u, fontWeight: 700, lineHeight: 1, color: brand.colors.text, textAlign: "center" }}
    />
  );
};

/** Headline on top, card below it, panel anchored above the Reels caption area. */
const Stage: React.FC<{ brand: Brand; headline?: React.ReactNode; card: React.ReactNode; panel?: React.ReactNode; cardTop?: number }> = ({
  brand,
  headline,
  card,
  panel,
  cardTop = 270,
}) => {
  const { u, isVertical } = useLayout();
  if (isVertical) {
    return (
      <AbsoluteFill>
        <Backdrop brand={brand} />
        {headline ? <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 * u }}>{headline}</AbsoluteFill> : null}
        <AbsoluteFill style={{ alignItems: "center", paddingTop: cardTop * u }}>{card}</AbsoluteFill>
        {panel ? <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 360 * u }}>{panel}</AbsoluteFill> : null}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Backdrop brand={brand} />
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 100 * u }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 * u }}>
          {headline}
          {card}
        </div>
        {panel}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const typedCount = (frame: number, from: number, perChar: number, length: number) =>
  frame < from ? 0 : Math.min(length, Math.floor((frame - from) / perChar) + 1);

/** A card dropping in from above and settling with a small bounce. */
const dropStyle = (t: number, fps: number, u: number, rot: number): React.CSSProperties => {
  if (t < 0) return { opacity: 0 };
  const p = spring({ frame: t, fps, config: { damping: 13, stiffness: 140, mass: 0.8 } });
  return {
    transform: `translateY(${(1 - p) * -1500 * u}px) rotate(${rot + (1 - p) * -14}deg) scale(${1 + (1 - p) * 0.2})`,
  };
};

// ─── hook: flash, then the polaroid develops ────────────────

const Hook: React.FC<{ d: PolaroidHook; brand: Brand }> = ({ d, brand }) => {
  const f = useCurrentFrame();
  const { u, fps } = useLayout();
  const flash = d.flashAt;

  const develop = interpolate(f, [flash + 6, flash + 28], [0, 1], { ...clamp, easing: outExpo });
  const white = f < flash ? interpolate(f, [flash - 4, flash], [0, 0.5], clamp) : interpolate(f, [flash, flash + 9], [1, 0], clamp);
  const count = typedCount(f, flash + 22, 1.5, d.caption.length);

  return (
    <AbsoluteFill style={{ background: brand.colors.bg }}>
      {f < flash ? (
        // before the flash: the original photo, full screen, creeping closer
        <AbsoluteFill style={{ transform: `scale(${interpolate(f, [0, flash], [1.04, 1.12], clamp)})` }}>
          <Img src={staticFile(d.original)} style={{ ...cover, objectPosition: "70% 50%" }} />
        </AbsoluteFill>
      ) : (
        <>
          <Backdrop brand={brand} />
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 * u }}>
            <AnimatedText
              text={d.headline}
              preset="slam"
              delay={flash + 14}
              style={{ fontSize: 150 * u, fontWeight: 700, lineHeight: 1, color: brand.colors.text, textAlign: "center" }}
            />
          </AbsoluteFill>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 60 * u }}>
            <div style={dropStyle(f - flash - 2, fps, u, -3)}>
              <PolaroidCard width={780 * u} frame={d.frame ?? "cream"} caption={d.caption.slice(0, count)}>
                {/* the photo "develops": starts washed out and blurry, settles to the real thing */}
                <AbsoluteFill style={{ filter: `brightness(${2.2 - 1.2 * develop}) contrast(${0.5 + 0.5 * develop}) blur(${(1 - develop) * 12 * u}px)` }}>
                  <Img src={staticFile(d.photo)} style={cover} />
                </AbsoluteFill>
                <AbsoluteFill style={{ background: "#E9E3D5", opacity: (1 - develop) * 0.5 }} />
              </PolaroidCard>
            </div>
          </AbsoluteFill>
          {d.kicker ? (
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 400 * u }}>
              <AnimatedText
                text={d.kicker}
                preset="rise"
                delay={flash + 30}
                style={{ fontSize: 40 * u, fontWeight: 500, letterSpacing: "0.2em", color: brand.colors.textMuted }}
              />
            </AbsoluteFill>
          ) : null}
        </>
      )}
      <AbsoluteFill style={{ background: "#fff", opacity: white }} />
    </AbsoluteFill>
  );
};

// ─── tune: sliders move, the photo changes live ─────────────

const Tune: React.FC<{ d: PolaroidTune; brand: Brand }> = ({ d, brand }) => {
  const f = useCurrentFrame();
  const { u, fps, isVertical } = useLayout();

  const panelSliders: PanelSlider[] = d.sliders.map((s) => ({
    label: s.label,
    from: s.from,
    to: s.to,
    max: 100,
    suffix: "%",
    start: s.start,
    end: s.end,
  }));
  const look: PolaroidLook = { ...DEFAULT_LOOK };
  d.sliders.forEach((s, i) => {
    look[s.param] = sliderValue(panelSliders[i], f);
  });
  const reveal = d.revealAt !== undefined ? interpolate(f, [d.revealAt, d.revealAt + 6], [0, 1], clamp) : 0;

  const cardW = (isVertical ? 600 : 520) * u;
  const sections: ControlSection[] = [
    { kind: "title", text: d.panelTitle ?? "polaroid" },
    ...panelSliders.map((slider) => ({ kind: "slider" as const, slider })),
  ];

  return (
    <Stage
      brand={brand}
      headline={<Headline text={d.headline} brand={brand} />}
      card={
        <div style={d.cardEnter === false ? undefined : enterStyle("rise", f - 2, fps, u)}>
          <PolaroidCard width={cardW} frame={d.frame ?? "cream"} caption={d.caption ?? "26.08.99"} style={{ transform: "rotate(-2deg)" }}>
            <LookPhoto src={d.original} look={look} size={cardW * CARD.photo} />
            {reveal > 0 ? <Img src={staticFile(d.photo)} style={{ ...cover, opacity: reveal }} /> : null}
          </PolaroidCard>
        </div>
      }
      panel={
        <div style={enterStyle("rise", f - 3, fps, u)}>
          <ControlPanel sections={sections} width={(isVertical ? 880 : 700) * u} />
        </div>
      }
    />
  );
};

// ─── frames: pills switch the frame color ───────────────────

const Frames: React.FC<{ d: PolaroidFrames; brand: Brand }> = ({ d, brand }) => {
  const f = useCurrentFrame();
  const { u, fps, isVertical } = useLayout();

  const idx = Math.max(0, d.changes.map((c) => f >= c.at).lastIndexOf(true));
  const now = d.changes[idx];
  const before = d.changes[Math.max(0, idx - 1)];
  const mix = idx === 0 ? 0 : interpolate(f, [now.at, now.at + 4], [0, 1], clamp);
  const pop = idx === 0 ? 1 : spring({ frame: f - now.at, fps, config: { damping: 9, stiffness: 240, mass: 0.5 } });
  const wobble = idx === 0 ? 0 : (1 - pop) * (idx % 2 ? 4 : -4);

  const sections: ControlSection[] = [
    { kind: "title", text: d.panelTitle ?? "polaroid" },
    {
      kind: "pills",
      label: "frame",
      options: FRAME_ORDER,
      select: d.changes.map((c) => ({ at: c.at, index: FRAME_ORDER.indexOf(c.frame) })),
    },
  ];
  const cardW = (isVertical ? 680 : 560) * u;

  return (
    <Stage
      brand={brand}
      headline={<Headline text={d.headline} brand={brand} />}
      cardTop={260}
      card={
        <div style={enterStyle("rise", f - 2, fps, u)}>
          <PolaroidCard
            width={cardW}
            frame={before.frame}
            frameTo={now.frame}
            mix={idx === 0 ? 0 : mix}
            caption={d.caption}
            style={{ transform: `rotate(${-2 + wobble}deg) scale(${0.94 + 0.06 * pop})` }}
          >
            <Img src={staticFile(d.photo)} style={cover} />
          </PolaroidCard>
        </div>
      }
      panel={
        <div style={enterStyle("rise", f - 3, fps, u)}>
          <ControlPanel sections={sections} width={(isVertical ? 880 : 700) * u} />
        </div>
      }
    />
  );
};

// ─── caption: typing, then the font changes ─────────────────

const Caption: React.FC<{ d: PolaroidCaption; brand: Brand }> = ({ d, brand }) => {
  const f = useCurrentFrame();
  const { u, fps, isVertical } = useLayout();

  const idx = Math.max(0, d.fonts.map((x) => f >= x.at).lastIndexOf(true));
  const font = d.fonts[idx].font;
  const cf = captionFonts[font];
  const count = typedCount(f, d.typeFrom, d.perChar, d.text.length);
  const typed = d.text.slice(0, count);
  const pop = idx === 0 ? 1 : spring({ frame: f - d.fonts[idx].at, fps, config: { damping: 9, stiffness: 240, mass: 0.5 } });
  const cursor = count < d.text.length || f % 16 < 8;

  const cardW = (isVertical ? 680 : 560) * u;
  const box: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 20 * u,
    background: "#14141B",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: `0 ${28 * u}px`,
    color: "#F2EEE4",
  };

  const panel = (
    <div
      style={{
        width: (isVertical ? 880 : 700) * u,
        padding: `${38 * u}px ${44 * u}px ${44 * u}px`,
        borderRadius: 32 * u,
        background: "rgba(10,10,16,0.94)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: `0 ${30 * u}px ${90 * u}px rgba(0,0,0,0.6)`,
        display: "flex",
        flexDirection: "column",
        gap: 30 * u,
      }}
    >
      <div style={{ fontSize: 26 * u, fontWeight: 600, letterSpacing: "0.22em", color: "rgba(255,255,255,0.45)" }}>{d.panelTitle ?? "polaroid"}</div>
      <div>
        <div style={{ fontSize: 31 * u, color: "rgba(255,255,255,0.85)", marginBottom: 16 * u }}>caption</div>
        <div style={{ ...box, height: 110 * u, justifyContent: "flex-start", fontFamily: cf.family, fontSize: 52 * u }}>
          {typed}
          <span style={{ display: "inline-block", width: 3 * u, height: 56 * u, marginLeft: 6 * u, background: "#F2EEE4", opacity: cursor ? 1 : 0 }} />
        </div>
      </div>
      <div style={{ ...box, height: 92 * u, fontFamily: cf.family, fontSize: 40 * u, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        <span>{cf.label}</span>
        <svg width={30 * u} height={30 * u} viewBox="0 0 20 20" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7l6 6 6-6" />
        </svg>
      </div>
    </div>
  );

  return (
    <Stage
      brand={brand}
      headline={<Headline text={d.headline} brand={brand} />}
      cardTop={260}
      card={
        <div style={enterStyle("rise", f - 2, fps, u)}>
          <PolaroidCard width={cardW} frame={d.frame ?? "cream"} caption={typed} font={font} captionScale={0.92 + 0.08 * pop} style={{ transform: "rotate(-2deg)" }}>
            <Img src={staticFile(d.photo)} style={cover} />
          </PolaroidCard>
        </div>
      }
      panel={<div style={enterStyle("rise", f - 3, fps, u)}>{panel}</div>}
    />
  );
};

// ─── pile: cards dropping on top of each other ──────────────

const PileItem: React.FC<{ c: PileCard; original: string }> = ({ c, original }) => {
  const f = useCurrentFrame();
  const { u, fps } = useLayout();
  const t = f - c.at;
  if (t < 0) return null;
  const p = spring({ frame: t, fps, config: { damping: 12, stiffness: 130, mass: 0.8 } });
  const W = c.width * u;
  const look: PolaroidLook = { ...DEFAULT_LOOK, ...c.look };

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "54%",
        transform: `translate(-50%, -50%) translate(${c.x * u}px, ${c.y * u + (1 - p) * -1500 * u}px) rotate(${c.rot + (1 - p) * -14}deg) scale(${1 + (1 - p) * 0.2})`,
      }}
    >
      <PolaroidCard width={W} frame={c.frame} caption={c.caption} font={c.font}>
        {c.real ? (
          <Img src={staticFile(c.real)} style={cover} />
        ) : (
          <LookPhoto src={original} look={look} size={W * CARD.photo} zoom={c.zoom} position={c.position} />
        )}
      </PolaroidCard>
    </div>
  );
};

const Pile: React.FC<{ d: PolaroidPile; brand: Brand }> = ({ d, brand }) => {
  const { u } = useLayout();
  return (
    <AbsoluteFill>
      <Backdrop brand={brand} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 * u }}>
        <Headline text={d.headline} brand={brand} />
      </AbsoluteFill>
      {d.cards.map((c, i) => (
        <PileItem key={i} c={c} original={d.original} />
      ))}
    </AbsoluteFill>
  );
};
