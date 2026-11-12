import React from "react";
import type { DisciplineContent } from "../../src/gym/discipline/template";
import { ClipSlot } from "../components/ClipSlot";
import { ThemePanel } from "../components/ThemePanel";

// What each workout clip is used for in the layout (from template.ts)
const MOVES = [
  { title: "workout clip 1", help: "used 3 times, including a big hit" },
  { title: "workout clip 2", help: "used most (6 times): your best clip" },
  { title: "workout clip 3", help: "used 3 times, one with a whip" },
  {
    title: "workout clip 4",
    help: "opens the cuts with a white flash; backlit or dark clips look great",
  },
  {
    title: "workout clip 5",
    help: "split screen, slices and letterbox: b-roll or wide shots work well",
  },
];

export const disciplineDefaults = (): DisciplineContent => ({
  theme: {
    blackAndWhite: false,
    colorBoost: false,
    bw: { exposure: 0, contrast: 1.2, brightness: 1 },
    boost: { amount: 1.8, exposure: 0, contrast: 1.1, brightness: 1 },
  },
  word: "DISCIPLINE",
  music: "gym/track.mp3", // the template's track
  hero: { src: "", at: 0 },
  flex: { src: "", moments: [0, 0, 0, 0] as [number, number, number, number] },
  moves: Array.from({ length: 5 }, () => ({
    src: "",
    moments: [] as number[],
  })) as DisciplineContent["moves"],
});

/** Is the project complete enough to render? Returns what's missing. */
export const disciplineMissing = (c: DisciplineContent) => {
  const missing: string[] = [];
  if (!c.hero.src) missing.push("hero clip");
  if (!c.flex.src) missing.push("flex clip");
  c.moves.forEach((m, i) => !m.src && missing.push(`workout clip ${i + 1}`));
  return missing;
};

export const DisciplineEditor: React.FC<{
  content: DisciplineContent;
  onChange: (c: DisciplineContent) => void;
  upload: (file: File) => Promise<string>;
}> = ({ content: c, onChange, upload }) => (
  <div className="editor">
    <div className="slot">
      <div className="slot-title">word</div>
      <input
        value={c.word}
        onChange={(e) => onChange({ ...c, word: e.target.value.toUpperCase() })}
      />
    </div>

    <ClipSlot
      title="hero"
      help="the clip behind the word: uses 3.4s from the start point. Pick a strong pose."
      src={c.hero.src}
      moments={c.hero.src ? [c.hero.at] : []}
      min={1}
      max={1}
      needs={3.4}
      upload={upload}
      onChange={({ src, moments }) => {
        const changed = src !== c.hero.src || moments[0] !== c.hero.at;
        // a new clip or start point needs a new cutout
        onChange({
          ...c,
          hero: {
            ...c.hero,
            src,
            at: moments[0] ?? 0,
            ...(changed ? { cutout: undefined } : {}),
          },
        });
      }}
    />
    {c.hero.cutout ? (
      <p className="muted small">
        cutout: {c.hero.cutout.folder} ({c.hero.cutout.count} frames)
      </p>
    ) : c.hero.src ? (
      <p className="warn small">
        no cutout yet: the word will sit in front of her (cutout button comes in
        step 4)
      </p>
    ) : null}

    <ClipSlot
      title="flex"
      help="4 moments: push-in, quick cut, big hit, and the glitch ending"
      src={c.flex.src}
      moments={c.flex.src ? c.flex.moments : []}
      min={4}
      max={4}
      needs={1.3}
      upload={upload}
      onChange={({ src, moments }) => {
        const m = [0, 1, 2, 3].map(
          (i) => moments[i] ?? moments[moments.length - 1] ?? 0,
        ) as [number, number, number, number];
        onChange({ ...c, flex: { ...c.flex, src, moments: m } });
      }}
    />

    {c.moves.map((m, i) => (
      <ClipSlot
        key={i}
        title={MOVES[i].title}
        help={MOVES[i].help}
        src={m.src}
        moments={m.moments}
        min={3}
        max={6}
        needs={1.2}
        upload={upload}
        onChange={({ src, moments }) => {
          const moves = [...c.moves] as DisciplineContent["moves"];
          moves[i] = { ...moves[i], src, moments };
          onChange({ ...c, moves });
        }}
      />
    ))}

    <ThemePanel
      theme={c.theme ?? disciplineDefaults().theme!}
      onChange={(theme) => onChange({ ...c, theme })}
    />
  </div>
);
