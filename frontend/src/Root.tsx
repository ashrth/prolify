import React from "react";
import { Composition, Folder } from "remotion";
import { PresetGallery } from "./core/PresetGallery";
import { getScriptDuration, VideoFromScript } from "./core/VideoFromScript";
import { x657oLaunch } from "./products/x657o/videos/launch";
import { aotBW, aotColor } from "./products/aot/edit";
import { dreamEdit } from "./products/dream/edit";
import { gymEdit } from "./products/gym/edit";
import { x657oAscii } from "./products/x657o/videos/ascii";
import { x657oAsciiEdit } from "./products/x657o/videos/ascii-edit";
import { x657oGoPro } from "./products/x657o/videos/go-pro";
import { x657oMotionBlur } from "./products/x657o/videos/motion-blur";
import { x657oPolaroid } from "./products/x657o/videos/polaroid";

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
      <Composition
        id="x657o-polaroid"
        component={VideoFromScript}
        durationInFrames={getScriptDuration(x657oPolaroid)}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ script: x657oPolaroid }}
      />
    </Folder>

    <Folder name="gym">
      <Composition
        id="gym-edit"
        component={VideoFromScript}
        durationInFrames={getScriptDuration(gymEdit)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ script: gymEdit }}
      />
    </Folder>

    <Folder name="dream">
      <Composition
        id="dream-edit"
        component={VideoFromScript}
        durationInFrames={getScriptDuration(dreamEdit)}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ script: dreamEdit }}
      />
    </Folder>

    <Folder name="aot">
      <Composition
        id="aot-bw"
        component={VideoFromScript}
        durationInFrames={getScriptDuration(aotBW)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ script: aotBW }}
      />
      <Composition
        id="aot-color"
        component={VideoFromScript}
        durationInFrames={getScriptDuration(aotColor)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ script: aotColor }}
      />
    </Folder>

    <Folder name="core">
      <Composition
        id="preset-gallery"
        component={PresetGallery}
        durationInFrames={120}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </Folder>
  </>
);
