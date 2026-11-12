import React, { useRef, useState } from "react";
import { playable } from "../api";
import { evenPick, smartPick, type Motion } from "./pick";

type Props = {
  title: string;
  help?: string;
  src: string;
  moments: number[];
  min: number; // moments needed (fewer is allowed for workout clips: they cycle)
  max: number;
  needs: number; // seconds of clip each moment uses
  pick?: number; // how many moments auto-pick chooses (default: min)
  mode?: "action" | "calm"; // what auto-pick looks for
  onChange: (v: { src: string; moments: number[] }) => void;
  upload: (file: File) => Promise<string>;
  analyze?: (src: string) => Promise<Motion>;
};

const round = (t: number) => Math.round(t * 10) / 10;

/** One slot: drop a clip, scrub it, mark the moments to use. */
export const ClipSlot: React.FC<Props> = ({
  title,
  help,
  src,
  moments,
  min,
  max,
  needs,
  pick,
  mode = "action",
  onChange,
  upload,
  analyze,
}) => {
  const video = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [busy, setBusy] = useState("");
  const [over, setOver] = useState(false);
  const single = max === 1;
  const count = single ? 1 : (pick ?? min);

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

  /** Ask the server where the movement is, and pick from it (even spread if that fails). */
  const autoPick = async (clip: string, d: number) => {
    if (!analyze)
      return onChange({ src: clip, moments: evenPick(d, count, needs) });
    setBusy("finding the best moments…");
    try {
      onChange({
        src: clip,
        moments: smartPick(await analyze(clip), count, needs, mode),
      });
    } catch {
      onChange({ src: clip, moments: evenPick(d, count, needs) });
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
              if (!moments.length) autoPick(src, d); // a fresh clip: pick moments right away
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
            {duration ? (
              <button
                className="secondary"
                onClick={() => autoPick(src, duration)}
                disabled={!!busy}
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
