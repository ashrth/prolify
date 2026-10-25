import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { clamp } from "../layout";
import type { Brand, PhotoStackScene as StackData, StackStep } from "../types";

const smooth = Easing.bezier(0.65, 0, 0.35, 1); // slow in, slow out: calm, not snappy

// clip-path for each region: [hidden while entering, final]
const CLIPS: Record<NonNullable<StackStep["region"]>, [string, string]> = {
  full: ["inset(0 0 0 0)", "inset(0 0 0 0)"],
  left: ["inset(0 100% 0 0)", "inset(0 50% 0 0)"],
  right: ["inset(0 0 0 100%)", "inset(0 0 0 50%)"],
  top: ["inset(0 0 100% 0)", "inset(0 0 50% 0)"],
  bottom: ["inset(100% 0 0 0)", "inset(50% 0 0 0)"],
};

/** Interpolate between two inset() strings with the same shape. */
const lerpInset = (a: string, b: string, p: number) => {
  const na = a.match(/[\d.]+/g)!.map(Number);
  const nb = b.match(/[\d.]+/g)!.map(Number);
  return `inset(${na.map((v, i) => `${v + (nb[i] - v) * p}%`).join(" ")})`;
};

export const PhotoStackScene: React.FC<{ data: StackData; brand: Brand }> = ({ data, brand }) => {
  const frame = useCurrentFrame();
  const T = data.transition ?? 14;

  // only draw from the last full-screen photo that has finished entering (everything under it is hidden)
  const started = data.steps.filter((s) => frame >= s.at);
  let base = 0;
  started.forEach((s, i) => {
    if ((s.region ?? "full") === "full" && frame >= s.at + T) base = i;
  });
  const visible = started.slice(base);

  // camera: slow push-in + gentle handheld sway (deterministic noise, smoothed)
  const push = interpolate(frame, [0, data.duration], [1.06, 1.16]);
  const sway = (k: string) => {
    const t = frame / 45;
    const i = Math.floor(t);
    const f = t - i;
    const a = random(`${k}-${i}`) - 0.5;
    const b = random(`${k}-${i + 1}`) - 0.5;
    return a + (b - a) * (f * f * (3 - 2 * f));
  };
  const camera = `scale(${push}) translate(${sway("x") * 14}px, ${sway("y") * 14}px) rotate(${sway("r") * 0.6}deg)`;

  const fadeOut = data.fadeOut ? interpolate(frame, [data.duration - data.fadeOut, data.duration], [0, 1], clamp) : 0;
  const fadeIn = interpolate(frame, [0, 6], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: camera }}>
        {visible.map((step) => {
          const region = step.region ?? "full";
          const enter = step.enter ?? (region === "full" ? "fade" : "slide");
          const p = interpolate(frame, [step.at, step.at + T], [0, 1], { ...clamp, easing: smooth });
          const [from, to] = CLIPS[region];
          const isFirst = step.at === 0;

          const style: React.CSSProperties = { clipPath: to };
          if (!isFirst && enter === "slide") style.clipPath = lerpInset(from, to, p);
          if (!isFirst && enter === "fade") {
            style.opacity = p;
            style.transform = `scale(${1.05 - 0.05 * p})`;
            style.filter = `blur(${(1 - p) * 8}px)`;
          }

          return (
            <AbsoluteFill key={`${step.at}-${step.image}`} style={style}>
              <Img
                src={staticFile(step.image)}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: data.objectPosition ?? "50% 50%" }}
              />
            </AbsoluteFill>
          );
        })}
      </AbsoluteFill>

      {data.grain ? (
        <AbsoluteFill
          style={{
            backgroundImage: `url(${staticFile("core/grain.png")})`,
            backgroundSize: "512px 512px",
            backgroundPosition: `${Math.floor(random(`g-${Math.floor(frame / 2)}`) * 512)}px ${Math.floor(random(`h-${Math.floor(frame / 2)}`) * 512)}px`,
            mixBlendMode: "overlay",
            opacity: 0.12,
          }}
        />
      ) : null}

      {/* soft vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)" }} />
      <AbsoluteFill style={{ background: brand.colors.bg, opacity: Math.max(fadeOut, fadeIn) }} />
    </AbsoluteFill>
  );
};
