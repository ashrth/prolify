/** How much movement there is through a clip, measured by the server. */
export type Motion = { step: number; duration: number; motion: number[] };

const round = (t: number) => Math.round(t * 10) / 10;

/** Evenly spread `count` moments between 0.2s and the last usable second (used if the analysis fails). */
export const evenPick = (duration: number, count: number, needs: number) => {
  const last = Math.max(0, duration - needs - 0.05);
  const first = Math.min(0.2, last);
  if (count <= 1) return [round(first)];
  return Array.from({ length: count }, (_, i) =>
    round(first + ((last - first) * i) / (count - 1)),
  );
};

/**
 * Pick `count` start points from the motion measurement.
 * action: the moments with the most movement (reps, flexes), spread apart.
 * calm: the steadiest stretch (a held pose).
 */
export const smartPick = (
  m: Motion,
  count: number,
  needs: number,
  mode: "action" | "calm",
) => {
  const lastStart = Math.floor((m.duration - needs) / m.step);
  if (lastStart < 1) return [0];
  // a shot shows about a second of clip, so score each start by the movement in the window after it
  const window = Math.max(
    1,
    Math.round((mode === "calm" ? needs : Math.min(needs, 1)) / m.step),
  );
  const score = Array.from({ length: lastStart + 1 }, (_, i) => {
    const slice = m.motion.slice(i, i + window);
    return slice.reduce((a, b) => a + b, 0) / Math.max(1, slice.length);
  });
  const order = score
    .map((_, i) => i)
    .sort((a, b) =>
      mode === "calm" ? score[a] - score[b] : score[b] - score[a],
    );
  const gap = Math.max(1, Math.round(Math.max(0.8, needs * 0.7) / m.step)); // keep moments apart
  const chosen: number[] = [];
  for (const i of order) {
    if (chosen.every((c) => Math.abs(c - i) >= gap)) chosen.push(i);
    if (chosen.length === count) break;
  }
  return chosen.sort((a, b) => a - b).map((i) => round(i * m.step));
};
