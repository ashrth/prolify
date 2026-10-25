import React from "react";
import { Composition, Folder } from "remotion";
import { PresetGallery } from "./core/PresetGallery";
import { getScriptDuration, VideoFromScript } from "./core/VideoFromScript";
import { x657oLaunch } from "./products/x657o/videos/launch";
import { x657oAscii } from "./products/x657o/videos/ascii";
import { x657oAsciiEdit } from "./products/x657o/videos/ascii-edit";
import { x657oGoPro } from "./products/x657o/videos/go-pro";
import { x657oMotionBlur } from "./products/x657o/videos/motion-blur";

const FPS = 30;

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="x657o">
      <Composition
        id="x657o-launch-landscape"
        component={VideoFromScript}
        durationInFrames={getScriptDuration(x657oLaunch)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ script: x657oLaunch }}
      />
      <Composition
        id="x657o-launch-vertical"
        component={VideoFromScript}
        durationInFrames={getScriptDuration(x657oLaunch)}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ script: x657oLaunch }}
      />
      <Composition
        id="x657o-motion-blur"
        component={VideoFromScript}
        durationInFrames={getScriptDuration(x657oMotionBlur)}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ script: x657oMotionBlur }}
      />
      <Composition
        id="x657o-go-pro"
        component={VideoFromScript}
        durationInFrames={getScriptDuration(x657oGoPro)}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ script: x657oGoPro }}
      />
      <Composition
        id="x657o-ascii"
        component={VideoFromScript}
        durationInFrames={getScriptDuration(x657oAscii)}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ script: x657oAscii }}
      />
      <Composition
        id="x657o-ascii-edit"
        component={VideoFromScript}
        durationInFrames={getScriptDuration(x657oAsciiEdit)}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ script: x657oAsciiEdit }}
      />
    </Folder>

    <Folder name="core">
      <Composition id="preset-gallery" component={PresetGallery} durationInFrames={120} fps={FPS} width={1920} height={1080} />
    </Folder>
  </>
);
