import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Backdrop } from "../components/Backdrop";
import { Cursor } from "../components/Cursor";
import { clamp, useLayout } from "../layout";
import { enterStyle, outExpo } from "../presets";
import type { Brand, PricingScene as PricingData } from "../types";

const CARD_START = 10; // first card appears
const CARD_GAP = 5; // frames between cards
const BADGE_START = 30;

/** "$29" → counts up from $0 with the same prefix. */
const countUp = (price: string, p: number) => {
  const match = price.match(/^(\D*)(\d+)(.*)$/);
  if (!match) return price;
  const [, pre, num, post] = match;
  return `${pre}${Math.round(Number(num) * p)}${post}`;
};

/** A rebuild of the app's "go pro" modal: cards rise in, prices count up, cursor picks a plan. */
export const PricingScene: React.FC<{ data: PricingData; brand: Brand }> = ({ data, brand }) => {
  const frame = useCurrentFrame();
  const { u, fps, isVertical } = useLayout();
  const clicked = frame >= data.clickAt;
  const pickPop = spring({ frame: frame - data.clickAt, fps, config: { damping: 12, stiffness: 200 } });

  return (
    <AbsoluteFill>
      <Backdrop brand={brand} />
      <AbsoluteFill
        style={{
          justifyContent: isVertical ? "flex-start" : "center",
          alignItems: "center",
          paddingTop: (isVertical ? 240 : 60) * u,
        }}
      >
        <div style={{ width: (isVertical ? 940 : 1500) * u }}>
          <AnimatedText
            text={data.title}
            preset="mask-up"
            style={{ fontSize: 130 * u, fontWeight: 700, lineHeight: 1, color: brand.colors.text }}
          />
          {data.subtitle ? (
            <AnimatedText
              text={data.subtitle}
              preset="fade"
              delay={6}
              style={{ fontSize: 30 * u, fontWeight: 500, letterSpacing: "0.12em", lineHeight: 1.5, color: brand.colors.textMuted, marginTop: 22 * u }}
            />
          ) : null}

          <div style={{ display: "flex", flexDirection: isVertical ? "column" : "row", gap: 26 * u, marginTop: 56 * u }}>
            {data.plans.map((plan, i) => {
              const start = CARD_START + i * CARD_GAP;
              const count = interpolate(frame, [start + 2, start + 14], [0, 1], { ...clamp, easing: outExpo });
              const isPick = i === data.pick;
              const highlight = clicked && isPick ? pickPop : 0;
              const dim = clicked && !isPick ? interpolate(frame, [data.clickAt, data.clickAt + 8], [1, 0.4], clamp) : 1;
              const pressed = isPick && frame >= data.clickAt && frame < data.clickAt + 5;

              return (
                <div
                  key={plan.name}
                  style={{
                    position: "relative",
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 24 * u,
                    padding: `${40 * u}px ${44 * u}px`,
                    borderRadius: 32 * u,
                    background: highlight > 0 ? "#121218" : brand.colors.panel,
                    border: `${(1 + highlight * 2) * u}px solid ${highlight > 0 ? "#fff" : "rgba(255,255,255,0.12)"}`,
                    opacity: dim,
                    ...enterStyle("rise", frame - start, fps, u),
                    transform: `${enterStyle("rise", frame - start, fps, u).transform ?? ""} scale(${1 + highlight * 0.03})`,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 18 * u }}>
                      <span style={{ fontSize: 34 * u, fontWeight: 600, letterSpacing: "0.16em", color: brand.colors.text }}>
                        {plan.name}
                      </span>
                      {plan.badge ? (
                        <span
                          style={{
                            fontSize: 22 * u,
                            fontWeight: 600,
                            letterSpacing: "0.08em",
                            padding: `${8 * u}px ${18 * u}px`,
                            borderRadius: 999,
                            background: "#24242B",
                            color: brand.colors.text,
                            ...enterStyle("pop", frame - BADGE_START - i * 3, fps, u),
                          }}
                        >
                          {plan.badge}
                        </span>
                      ) : null}
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 14 * u, marginTop: 14 * u }}>
                      <span style={{ fontSize: 120 * u, fontWeight: 700, lineHeight: 1, color: brand.colors.text, fontVariantNumeric: "tabular-nums" }}>
                        {countUp(plan.price, count)}
                      </span>
                      <span style={{ fontSize: 40 * u, fontWeight: 500, color: brand.colors.textMuted }}>{plan.suffix}</span>
                    </div>
                  </div>

                  <div
                    style={{
                      flexShrink: 0,
                      padding: `${28 * u}px ${44 * u}px`,
                      borderRadius: 20 * u,
                      background: "#fff",
                      color: "#05050A",
                      fontSize: 32 * u,
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      transform: `scale(${pressed ? 0.93 : 1})`,
                    }}
                  >
                    {data.button}
                  </div>

                  {isPick ? (
                    <Cursor from={{ x: 0.45, y: 2.4 }} to={{ x: 0.83, y: 0.5 }} clickAt={data.clickAt} />
                  ) : null}
                </div>
              );
            })}
          </div>

          {data.note ? (
            <AnimatedText
              text={data.note}
              preset="slam"
              delay={data.clickAt + 6}
              style={{ fontSize: 64 * u, fontWeight: 700, color: brand.colors.text, marginTop: 56 * u, textAlign: "center" }}
            />
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
