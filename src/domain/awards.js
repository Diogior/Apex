// Awards: milestones earned from data Apex already has. Pure functions.
import { computeE1RM, computeWeighInStreak } from "./engine.js";
import { workingSets } from "./workout.js";

const SESSION_MILESTONES = [10, 25, 50, 100, 250];
const PR_MILESTONES = [1, 10, 25, 50];

/** Every session where a lift beat all earlier estimated 1-rep maxes. First-ever lifts don't count. */
export function countPRs(history) {
  const best = {};
  let prs = 0;
  for (const h of [...(history || [])].sort((a, b) => a.ts - b.ts)) {
    for (const ex of h.completedExercises || []) {
      const sets = workingSets(ex.loggedSets);
      if (!sets.length) continue;
      const top = Math.max(...sets.map((s) => computeE1RM(s.weight, s.reps)));
      if (ex.name in best && top > best[ex.name]) prs++;
      best[ex.name] = Math.max(best[ex.name] || 0, top);
    }
  }
  return prs;
}

function milestone(id, title, value, steps, unit) {
  const earnedSteps = steps.filter((s) => value >= s);
  const nextStep = steps.find((s) => value < s);
  return {
    earned: earnedSteps.map((s) => ({ id: `${id}-${s}`, title: title(s), value: s, unit })),
    next: nextStep ? { id: `${id}-${nextStep}`, title: title(nextStep), value: nextStep, unit, progress: value / nextStep, current: value } : null,
  };
}

/**
 * @param history      training sessions
 * @param weightLog    weigh-ins
 * @param ringDays     recent days from ringHistory(), each with allClosed
 * @param frequency    the split's sessions per week (sizes the monthly challenge)
 */
export function computeAwards({ history = [], weightLog = [], ringDays = [], frequency = 4, now }) {
  const earned = [];
  const next = [];

  if (history.length) earned.push({ id: "first-workout", title: "First workout", value: 1, unit: "session" });

  const sessions = milestone("sessions", (n) => `${n} workouts`, history.length, SESSION_MILESTONES, "sessions");
  earned.push(...sessions.earned);
  if (sessions.next) next.push(sessions.next);

  const prs = milestone("prs", (n) => (n === 1 ? "First personal record" : `${n} personal records`), countPRs(history), PR_MILESTONES, "PRs");
  earned.push(...prs.earned);
  if (prs.next) next.push(prs.next);

  const streak = computeWeighInStreak(weightLog);
  const weighIns = milestone("weigh-streak", (n) => `${n}-day weigh-in streak`, streak.best, [7, 30, 100], "days");
  earned.push(...weighIns.earned);
  if (weighIns.next) next.push({ ...weighIns.next, current: streak.current, progress: streak.current / weighIns.next.value });

  const perfect = ringDays.filter((d) => d.allClosed).length;
  if (perfect) earned.push({ id: "perfect-day", title: perfect === 1 ? "Perfect day" : `${perfect} perfect days`, value: perfect, unit: "days", detail: "All three rings closed" });

  // Monthly challenge, sized to the split: the planned sessions for this calendar month.
  const d = new Date(now);
  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const target = Math.max(1, Math.round((frequency * daysInMonth) / 7));
  const done = history.filter((h) => h.ts >= monthStart && h.ts <= now).length;
  const challenge = {
    id: `month-${d.getFullYear()}-${d.getMonth() + 1}`,
    title: `${d.toLocaleDateString("en-US", { month: "long" })} challenge`,
    detail: `Complete ${target} workouts this month`,
    current: done, target, progress: Math.min(1, done / target), earned: done >= target,
  };

  return { earned, next, challenge };
}
