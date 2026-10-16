import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Series,
  staticFile,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { fontFamily, fonts } from "./fonts";
import { BrowserDemoScene } from "./scenes/BrowserDemoScene";
import { CtaScene } from "./scenes/CtaScene";
import { EffectDemoScene } from "./scenes/EffectDemoScene";
import { EffectFlipScene } from "./scenes/EffectFlipScene";
import { FlashCutsScene } from "./scenes/FlashCutsScene";
import { HookScene } from "./scenes/HookScene";
import { ImageTitleScene } from "./scenes/ImageTitleScene";
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
    case "image-title":
      return <ImageTitleScene data={scene} brand={brand} />;
    case "flash-cuts":
      return <FlashCutsScene data={scene} brand={brand} />;
    case "effect-demo":
      return <EffectDemoScene data={scene} brand={brand} />;
  }
};

export const getScriptDuration = (script: VideoScript) =>
  script.scenes.reduce((total, scene) => total + scene.duration, 0);

// Background music for the whole video, with a fade in and out
const Music: React.FC<{ src: string; volume: number }> = ({ src, volume }) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <Audio
      src={staticFile(src)}
      volume={(f: number) =>
        interpolate(
          f,
          [0, 15, durationInFrames - 30, durationInFrames],
          [0, volume, volume, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        )
      }
    />
  );
};

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
          <AbsoluteFill
            style={{ fontFamily: scene.font ? fonts[scene.font] : undefined }}
          >
            {renderScene(scene, script.brand)}
          </AbsoluteFill>
          {/* this scene's sounds; `at` counts from the start of the scene */}
          {scene.sounds?.map((s, j) => (
            <Audio
              key={j}
              from={s.at ?? 0}
              durationInFrames={s.duration}
              src={staticFile(s.src)}
              volume={s.volume ?? 1}
            />
          ))}
        </Series.Sequence>
      ))}
    </Series>
    {script.music ? (
      <Music src={script.music.src} volume={script.music.volume ?? 0.6} />
    ) : null}
  </AbsoluteFill>
);
