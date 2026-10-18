// Workout maths for the live session and its summary: rep ranges, next-session
// load suggestions, volume, personal records and rest times. Pure functions.
import { computeE1RM } from "./engine.js";

const LOWER_BODY = new Set(["quads", "hams", "glutes"]);

/** "6–10" -> { min: 6, max: 10 }. Mixed schemes ("1×2–5, 2×3–8") use the last range. */
export function parseRepRange(range) {
  const ranges = [...String(range || "").matchAll(/(\d+)\s*[–-]\s*(\d+)/g)];
  if (!ranges.length) {
    const single = String(range || "").match(/\d+/);
    return single ? { min: Number(single[0]), max: Number(single[0]) } : null;
  }
  const [, a, b] = ranges[ranges.length - 1];
  return { min: Math.min(Number(a), Number(b)), max: Math.max(Number(a), Number(b)) };
}

/** Sets that count: both weight and reps entered. */
export function workingSets(sets) {
  return (sets || []).filter((s) => Number(s.weight) > 0 && Number(s.reps) > 0);
}

/**
 * Double progression: when every working set reaches the top of the rep range,
 * add load next time (10 lb for lower-body compounds, 5 lb otherwise).
 */
export function suggestNextLoad(exercise, sets) {
  const range = parseRepRange(exercise?.repRange);
  const done = workingSets(sets);
  if (!range || !done.length) return null;
  const weight = Math.max(...done.map((s) => Number(s.weight)));
  if (done.every((s) => Number(s.reps) >= range.max)) {
    const increment = exercise.category === "compound" && LOWER_BODY.has(exercise.muscle) ? 10 : 5;
    return { kind: "up", increment, weight: weight + increment, text: `+${increment} lb next time` };
  }
  if (done.some((s) => Number(s.reps) < range.min)) {
    return { kind: "hold", weight, text: `Hold ${weight} lb and rebuild to ${range.min}+ reps` };
  }
  return { kind: "reps", weight, text: `Same weight, chase ${range.max} reps` };
}

/** Total load moved: sum of weight × reps over working sets. */
export function sessionVolume(completedExercises) {
  return (completedExercises || []).reduce(
    (t, ex) => t + workingSets(ex.loggedSets).reduce((s, set) => s + Number(set.weight) * Number(set.reps), 0),
    0,
  );
}

/** Best estimated 1-rep max per exercise name across past sessions. */
export function bestE1RMByName(history) {
  const best = {};
  for (const h of history || []) {
    for (const ex of h.completedExercises || []) {
      for (const s of workingSets(ex.loggedSets)) {
        const e = computeE1RM(s.weight, s.reps);
        if (e > (best[ex.name] || 0)) best[ex.name] = e;
      }
    }
  }
  return best;
}

/** Best estimated 1-rep max per past session for one exercise, oldest first. */
export function e1rmSeries(history, name) {
  return (history || [])
    .map((h) => {
      const ex = (h.completedExercises || []).find((e) => e.name === name);
      const sets = workingSets(ex?.loggedSets);
      if (!sets.length) return null;
      return { ts: h.ts, e1rm: Math.max(...sets.map((x) => computeE1RM(x.weight, x.reps))) };
    })
    .filter(Boolean)
    .sort((a, b) => a.ts - b.ts);
}

/** Exercises where this session beat every earlier session's estimated 1-rep max. */
export function findPRs(completedExercises, priorHistory) {
  const best = bestE1RMByName(priorHistory);
  const prs = [];
  for (const ex of completedExercises || []) {
    const sets = workingSets(ex.loggedSets);
    if (!sets.length || !(ex.name in best)) continue; // a first-ever lift sets a baseline, not a record
    const top = sets.reduce((a, s) => (computeE1RM(s.weight, s.reps) > computeE1RM(a.weight, a.reps) ? s : a));
    const e1rm = computeE1RM(top.weight, top.reps);
    if (e1rm > best[ex.name]) prs.push({ name: ex.name, e1rm, previous: best[ex.name], weight: Number(top.weight), reps: Number(top.reps) });
  }
  return prs;
}

/** Rest between sets: longer for compounds. */
export function restSecondsFor(exercise) {
  if (!exercise) return 120;
  if (exercise.category === "compound") return LOWER_BODY.has(exercise.muscle) ? 180 : 150;
  return 90;
}

/** Apple Watch-style effort words for a 1-10 rating. */
export function effortLabel(n) {
  if (!n) return "";
  if (n <= 3) return "Easy";
  if (n <= 6) return "Moderate";
  if (n <= 8) return "Hard";
  return "All out";
}

/** Everything the post-workout summary shows. `priorHistory` excludes this session. */
export function summarizeSession(result, priorHistory, dayPlan) {
  const exercises = result?.completedExercises || [];
  const plan = Object.fromEntries((dayPlan?.exercises || []).map((e) => [e.id, e]));
  const next = exercises
    .map((ex) => {
      const s = suggestNextLoad(plan[ex.id] || ex, ex.loggedSets);
      return s ? { name: ex.name, ...s } : null;
    })
    .filter(Boolean);
  return {
    minutes: Math.max(1, Math.round((result?.duration || 0) / 60)),
    sets: exercises.reduce((n, ex) => n + workingSets(ex.loggedSets).length, 0),
    volume: Math.round(sessionVolume(exercises)),
    prs: findPRs(exercises, priorHistory),
    next,
    effort: result?.effort || null,
  };
}
