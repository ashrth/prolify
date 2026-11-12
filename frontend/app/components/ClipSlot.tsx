import React, { useRef, useState } from "react";
import { playable } from "../api";

type Props = {
  title: string;
  help?: string;
  src: string;
  moments: number[];
  min: number; // moments needed (fewer is allowed for workout clips: they cycle)
  max: number;
  needs: number; // seconds of clip each moment uses
  onChange: (v: { src: string; moments: number[] }) => void;
  upload: (file: File) => Promise<string>;
};

const round = (t: number) => Math.round(t * 10) / 10;

/** Evenly spread `count` moments between 0.2s and the last usable second. */
export const autoPick = (duration: number, count: number, needs: number) => {
  const last = Math.max(0, duration - needs - 0.05);
  if (count <= 1) return [round(Math.min(0.2, last))];
  return Array.from({ length: count }, (_, i) =>
    round(
      Math.min(0.2, last) + ((last - Math.min(0.2, last)) * i) / (count - 1),
    ),
  );
};

/** One slot: drop a clip, scrub it, mark the moments to use. */
export const ClipSlot: React.FC<Props> = ({
  title,
  help,
  src,
  moments,
  min,
  max,
  needs,
  onChange,
  upload,
}) => {
  const video = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [busy, setBusy] = useState("");
  const [over, setOver] = useState(false);
  const single = max === 1;

  const take = async (file?: File | null) => {
    if (!file) return;
    setBusy(`uploading ${file.name}…`);
    try {
      const url = await upload(file);
      onChange({ src: url, moments: [] }); // moments get picked once the clip's length is known
    } catch (e) {
      alert(String(e));
    }
    setBusy("");
  };

  const usable = duration ? duration - needs : Infinity;
  const tooLate = (t: number) => t > usable;

  return (
    <div className="slot">
      <div className="slot-head">
        <div>
          <div className="slot-title">{title}</div>
          {help ? <div className="muted small">{help}</div> : null}
        </div>
        {src ? (
          <label className="link">
            replace
            <input
              type="file"
              accept="video/*"
              hidden
              onChange={(e) => take(e.target.files?.[0])}
            />
          </label>
        ) : null}
      </div>

      {!src ? (
        <label
          className={`drop ${over ? "over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            take(e.dataTransfer.files[0]);
          }}
        >
          {busy || "drop a clip here, or click to choose"}
          <input
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => take(e.target.files?.[0])}
          />
        </label>
      ) : (
        <>
          <video
            ref={video}
            src={playable(src)}
            controls
            muted
            preload="metadata"
            className="player"
            onLoadedMetadata={(e) => {
              const d = e.currentTarget.duration;
              setDuration(d);
              if (!moments.length)
                onChange({
                  src,
                  moments: autoPick(d, single ? 1 : min, needs),
                });
            }}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          />
          <div className="moments">
            {moments.map((m, i) => (
              <span
                key={i}
                className={`chip ${tooLate(m) ? "bad" : ""}`}
                title={
                  tooLate(m)
                    ? `too close to the end: needs ${needs}s after it`
                    : "jump here"
                }
              >
                <button
                  className="chip-time"
                  onClick={() =>
                    video.current && (video.current.currentTime = m)
                  }
                >
                  {m.toFixed(1)}s
                </button>
                {!single ? (
                  <button
                    className="chip-x"
                    onClick={() =>
                      onChange({
                        src,
                        moments: moments.filter((_, j) => j !== i),
                      })
                    }
                  >
                    ×
                  </button>
                ) : null}
              </span>
            ))}
          </div>
          <div className="row small-gap">
            <button
              className="secondary"
              disabled={tooLate(time) || (!single && moments.length >= max)}
              onClick={() =>
                onChange({
                  src,
                  moments: single
                    ? [round(time)]
                    : [...moments, round(time)].sort((a, b) => a - b),
                })
              }
            >
              {single
                ? `start here (${time.toFixed(1)}s)`
                : `add moment here (${time.toFixed(1)}s)`}
            </button>
            {!single && duration ? (
              <button
                className="secondary"
                onClick={() =>
                  onChange({ src, moments: autoPick(duration, min, needs) })
                }
              >
                auto-pick
              </button>
            ) : null}
            {busy ? <span className="muted small">{busy}</span> : null}
          </div>
          {!single && moments.length < min ? (
            <div className="warn small">
              add at least {min} moments (or fewer: they'll repeat)
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};
