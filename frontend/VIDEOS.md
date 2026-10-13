# Prolify video studio

## Commands

- `npx remotion studio`: preview in the browser
- `npx remotion render x657o-launch-landscape out/x657o-landscape.mp4`
- `npx remotion render x657o-launch-vertical out/x657o-vertical.mp4`

## How it's organized

```
src/
  core/                  shared by every product
    types.ts             scene types + animation preset names
    presets.ts           the animations (slam, rise, mask-up, blur-in, pop, fade)
    components/          AnimatedText, CardWall, Cursor, Backdrop
    scenes/              one file per scene type
    VideoFromScript.tsx  turns a script into a video
    PresetGallery.tsx    preview of every preset (composition: preset-gallery)
  products/
    x657o/
      brand.ts           colors, logo, url
      videos/launch.ts   the script: list of scenes with text, images, timing
  Root.tsx               registers compositions
public/
  x657o/                 that product's images
```

## Common edits

- Change text or timing: edit the product's video file (`products/<name>/videos/*.ts`). 30 frames = 1 second.
- New video for the same product: copy `launch.ts`, change the scenes, register it in `Root.tsx`.
- New product: add `products/<name>/brand.ts` + a video file, put assets in `public/<name>/`, register in `Root.tsx`.
- New animation: add a name in `types.ts` (`EnterPreset`) and a case in `presets.ts`.
- New scene type: add a component in `core/scenes/`, its type in `types.ts`, and a case in `VideoFromScript.tsx`.
