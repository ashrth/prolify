import React from "react";
import { useCurrentFrame } from "remotion";
import { useLayout } from "../layout";
import { enterStyle } from "../presets";
import type { EnterPreset } from "../types";

type Props = {
  text: string;
  preset?: EnterPreset;
  delay?: number; // frames before it starts
  stagger?: number; // frames between each word/letter (0 = animate as one block)
  splitBy?: "word" | "char";
  style?: React.CSSProperties; // the block (font size, color, alignment…)
  wordStyle?: React.CSSProperties; // each animated piece (e.g. gradient text)
};

export const AnimatedText: React.FC<Props> = ({
  text,
  preset = "rise",
  delay = 0,
  stagger = 0,
  splitBy = "word",
  style,
  wordStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps, u } = useLayout();

  const pieces = stagger > 0 ? (splitBy === "char" ? [...text] : text.split(" ")) : [text];
  const joiner = stagger > 0 && splitBy === "word" ? " " : "";
  const masked = preset === "mask-up";

  return (
    <div style={style}>
      {pieces.map((piece, i) => {
        const anim = enterStyle(preset, frame - delay - i * stagger, fps, u);
        const inner = (
          <span style={{ display: "inline-block", whiteSpace: "pre", ...wordStyle, ...anim }}>{piece}</span>
        );
        return (
          <React.Fragment key={i}>
            {masked ? (
              <span
                style={{
                  display: "inline-block",
                  overflow: "hidden",
                  verticalAlign: "top",
                  padding: "0.06em 0",
                  margin: "-0.06em 0",
                }}
              >
                {inner}
              </span>
            ) : (
              inner
            )}
            {i < pieces.length - 1 ? joiner : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};
