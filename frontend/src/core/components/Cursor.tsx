import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { clamp, useLayout } from "../layout";

type Props = {
  from: { x: number; y: number }; // 0–1 inside the parent
  to: { x: number; y: number };
  clickAt: number; // frame of the click; travel happens in the 36 frames before it
};

/** Mouse cursor that glides to a point and clicks. Place inside a position:relative parent. */
export const Cursor: React.FC<Props> = ({ from, to, clickAt }) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();

  const travel = interpolate(frame, [clickAt - 36, clickAt - 4], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });
  const x = from.x + (to.x - from.x) * travel;
  // slight arc so it doesn't move in a robotic straight line
  const y = from.y + (to.y - from.y) * travel - Math.sin(travel * Math.PI) * 0.04;

  const pressed = frame >= clickAt && frame < clickAt + 6;
  const ripple = interpolate(frame, [clickAt, clickAt + 20], [0, 1], clamp);
  const visible = interpolate(frame, [clickAt - 44, clickAt - 36], [0, 1], clamp);
  const size = 46 * u;

  return (
    <>
      {frame >= clickAt ? (
        <div
          style={{
            position: "absolute",
            left: `${to.x * 100}%`,
            top: `${to.y * 100}%`,
            width: (20 + ripple * 150) * u,
            height: (20 + ripple * 150) * u,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: `${3 * u}px solid rgba(255,255,255,${1 - ripple})`,
          }}
        />
      ) : null}
      <svg
        viewBox="0 0 20 26"
        width={size}
        height={size * 1.3}
        style={{
          position: "absolute",
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          opacity: visible,
          transform: `scale(${pressed ? 0.82 : 1})`,
          transformOrigin: "top left",
          filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.5))",
        }}
      >
        <path
          d="M1 1 L1 21 L6.5 16 L10.5 24.5 L14 23 L10 14.8 L17 14.8 Z"
          fill="#fff"
          stroke="#000"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
};
