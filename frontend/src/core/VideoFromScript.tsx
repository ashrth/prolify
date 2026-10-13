import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  Series,
  staticFile,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "./fonts";
import { Audio } from "@remotion/media";
import { BrowserDemoScene } from "./scenes/BrowserDemoScene";
import { CtaScene } from "./scenes/CtaScene";
import { EffectFlipScene } from "./scenes/EffectFlipScene";
import { HookScene } from "./scenes/HookScene";
import { StatementScene } from "./scenes/StatementScene";
import { StepsScene } from "./scenes/StepsScene";
import { StrikeListScene } from "./scenes/StrikeListScene";
import type { Brand, Scene, VideoScript } from "./types";

// Add a new scene type: create it in scenes/, add its type to types.ts, add a case here.
const renderScene = (scene: Scene, brand: Brand) => {
  switch (scene.type) {
    case "hook":
      return <HookScene data={scene} brand={brand} />;
    case "strike-list":
      return <StrikeListScene data={scene} brand={brand} />;
    case "effect-flip":
      return <EffectFlipScene data={scene} brand={brand} />;
    case "browser-demo":
      return <BrowserDemoScene data={scene} brand={brand} />;
    case "steps":
      return <StepsScene data={scene} brand={brand} />;
    case "statement":
      return <StatementScene data={scene} brand={brand} />;
    case "cta":
      return <CtaScene data={scene} brand={brand} />;
  }
};

const sceneStart = (script: VideoScript, index: number) =>
  script.scenes.slice(0, index).reduce((t, s) => t + s.duration, 0);

const Soundtrack: React.FC<{ script: VideoScript }> = ({ script }) => {
  const { durationInFrames } = useVideoConfig();
  const music = script.music;
  const vol = music?.volume ?? 0.6;
  return (
    <>
      {music ? (
        <Audio
          src={staticFile(music.src)}
          // fade in over 0.5s, fade out over the last 1s
          volume={(f) =>
            interpolate(
              f,
              [0, 15, durationInFrames - 30, durationInFrames],
              [0, vol, vol, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            )
          }
        />
      ) : null}
      {script.sfx?.map((cue, i) => (
        <Audio
          key={i}
          from={sceneStart(script, cue.scene) + (cue.at ?? 0)}
          src={staticFile(cue.src)}
          volume={cue.volume ?? 1}
        />
      ))}
    </>
  );
};

export const getScriptDuration = (script: VideoScript) =>
  script.scenes.reduce((total, scene) => total + scene.duration, 0);

export const VideoFromScript: React.FC<{ script: VideoScript }> = ({
  script,
}) => (
  <AbsoluteFill style={{ fontFamily, background: script.brand.colors.bg }}>
    <Series>
      {script.scenes.map((scene, i) => (
        <Series.Sequence
          key={i}
          durationInFrames={scene.duration}
          name={`${i + 1}. ${scene.type}`}
        >
          {renderScene(scene, script.brand)}
        </Series.Sequence>
      ))}
    </Series>
    <Soundtrack script={script} />
  </AbsoluteFill>
);
