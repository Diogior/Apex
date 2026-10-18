// Trends: this week against your 90-day average, the way Apple Fitness compares
// recent activity with a longer baseline. Pure functions, no React or storage.
import { getGoalRateInfo, linearRegression } from "./engine.js";
import { workingSets, bestE1RMByName } from "./workout.js";
import { computeE1RM } from "./engine.js";
import { nutritionDate } from "./rings.js";

const DAY = 86400000;
const FLAT = 0.03; // under 3% change counts as steady

/** Apex goals map onto the engine's rate bands. */
export function rateInfoForGoal(goal) {
  const key = { maintain: "maintenance", lifestyle: "maintenance" }[goal] || goal;
  return getGoalRateInfo(key);
}

/** Weekly rate (lb/week) from a least-squares fit over weigh-ins in [from, to]. */
export function weeklyRate(weightLog, from, to) {
  const pts = (weightLog || []).filter((e) => e.ts >= from && e.ts <= to).sort((a, b) => a.ts - b.ts);
  if (pts.length < 3) return null;
  const { slope } = linearRegression(pts.map((e) => ({ x: (e.ts - pts[0].ts) / DAY, y: Number(e.weight) })));
  return Math.round(slope * 7 * 100) / 100;
}

/**
 * The healthy corridor for a goal, starting at the first weigh-in: at each point,
 * where the weight would be at the slow and fast ends of the goal's rate band.
 */
export function weightCorridor(points, goal) {
  const info = rateInfoForGoal(goal);
  if (!info || !points?.length) return null;
  const start = points[0];
  return points.map((p) => {
    const weeks = (p.x - start.x) / (7 * DAY);
    const a = start.y + info.min * weeks;
    const b = start.y + info.max * weeks;
    return { x: p.x, lo: Math.min(a, b), hi: Math.max(a, b) };
  });
}

function direction(current, baseline) {
  if (current === null || baseline === null || baseline === 0) return "flat";
  const change = (current - baseline) / Math.abs(baseline);
  if (Math.abs(change) < FLAT) return "flat";
  return change > 0 ? "up" : "down";
}

const round1 = (x) => (x === null ? null : Math.round(x * 10) / 10);

/** Average protein per logged day between two timestamps, as a fraction of target. */
function proteinAdherence(nutLogs, target, from, to) {
  if (!target) return null;
  const byDate = {};
  for (const l of nutLogs || []) byDate[l.date] = (byDate[l.date] || 0) + (l.totals?.protein_g || 0);
  const days = [];
  for (let t = from; t <= to; t += DAY) {
    const d = nutritionDate(t);
    if (byDate[d] !== undefined) days.push(byDate[d] / target);
  }
  return days.length ? days.reduce((a, b) => a + b, 0) / days.length : null;
}

function setsBetween(history, from, to) {
  return (history || []).filter((h) => h.ts >= from && h.ts <= to).reduce((n, h) => n + (h.completedExercises || []).reduce((m, ex) => m + workingSets(ex.loggedSets).length, 0), 0);
}

function sessionsBetween(history, from, to) {
  return (history || []).filter((h) => h.ts >= from && h.ts <= to).length;
}

/** The exercise logged in the most sessions. */
export function topLift(history) {
  const counts = {};
  for (const h of history || []) for (const ex of h.completedExercises || []) if (workingSets(ex.loggedSets).length) counts[ex.name] = (counts[ex.name] || 0) + 1;
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] >= 2 ? best[0] : null;
}

/**
 * Each trend compares the last 7 days with the weekly average over the last 90
 * days (or since the first entry, if that's sooner). `good` is true/false when
 * the direction has a clear meaning for the goal, otherwise null.
 */
export function computeTrends({ now, weightLog = [], nutLogs = [], proteinTarget = 0, history = [], goal }) {
  const weekStart = now - 7 * DAY;
  const firstTs = Math.min(now, ...weightLog.map((e) => e.ts), ...history.map((h) => h.ts));
  const baseStart = Math.max(now - 90 * DAY, firstTs);
  const baseWeeks = Math.max(1, (now - baseStart) / (7 * DAY));
  const enoughHistory = now - firstTs >= 14 * DAY;
  const out = [];

  // Weight rate, judged against the goal's band rather than against the past.
  const info = rateInfoForGoal(goal);
  const rate = weeklyRate(weightLog, now - 14 * DAY, now);
  if (rate !== null) {
    const inBand = info ? rate >= Math.min(info.min, info.max) && rate <= Math.max(info.min, info.max) : null;
    out.push({
      id: "weight", label: "Weight change", unit: "lb/wk", value: rate,
      baseline: weeklyRate(weightLog, baseStart, now),
      direction: rate > 0.05 ? "up" : rate < -0.05 ? "down" : "flat",
      good: inBand,
      detail: info ? `Goal band ${Math.min(info.min, info.max)} to ${Math.max(info.min, info.max)} lb/wk` : "Last 14 days",
    });
  }

  const protein = proteinAdherence(nutLogs, proteinTarget, weekStart, now);
  if (protein !== null) {
    const base = enoughHistory ? proteinAdherence(nutLogs, proteinTarget, baseStart, now) : null;
    const dir = direction(protein, base);
    out.push({ id: "protein", label: "Protein", unit: "% of target", value: Math.round(protein * 100), baseline: base === null ? null : Math.round(base * 100), direction: dir, good: dir === "flat" ? null : dir === "up", detail: "Average on logged days" });
  }

  if (history.length) {
    const setsNow = setsBetween(history, weekStart, now);
    const setsBase = enoughHistory ? round1(setsBetween(history, baseStart, now) / baseWeeks) : null;
    const dSets = direction(setsNow, setsBase);
    out.push({ id: "sets", label: "Working sets", unit: "this week", value: setsNow, baseline: setsBase, direction: dSets, good: dSets === "flat" ? null : dSets === "up", detail: "Sets with weight and reps" });

    const sessNow = sessionsBetween(history, weekStart, now);
    const sessBase = enoughHistory ? round1(sessionsBetween(history, baseStart, now) / baseWeeks) : null;
    const dSess = direction(sessNow, sessBase);
    out.push({ id: "sessions", label: "Sessions", unit: "this week", value: sessNow, baseline: sessBase, direction: dSess, good: dSess === "flat" ? null : dSess === "up", detail: "Completed workouts" });

    const lift = topLift(history);
    if (lift) {
      const recent = history.filter((h) => h.ts >= now - 14 * DAY);
      const current = bestE1RMByName(recent)[lift] || null;
      const base = history.filter((h) => h.ts >= baseStart).map((h) => {
        const ex = (h.completedExercises || []).find((e) => e.name === lift);
        const sets = workingSets(ex?.loggedSets);
        return sets.length ? Math.max(...sets.map((s) => computeE1RM(s.weight, s.reps))) : null;
      }).filter(Boolean);
      const baseAvg = base.length ? Math.round(base.reduce((a, b) => a + b, 0) / base.length) : null;
      if (current !== null) {
        const d = direction(current, baseAvg);
        out.push({ id: "strength", label: lift, unit: "lb est. 1RM", value: current, baseline: baseAvg, direction: d, good: d === "flat" ? null : d === "up", detail: "Best in the last 14 days" });
      }
    }
  }
  return out;
}
