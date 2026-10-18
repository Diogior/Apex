// Apex's three daily rings (Train, Fuel, Track) and the single "Next" action on Home.
// Pure functions over the data Apex already stores; no React, no storage.
//
//   Train  closes when today's session is done, or on a rest day once the week's
//          sessions are in (sessions in the last 7 days >= the split's frequency).
//   Fuel   tracks protein against target; it counts as closed only when calories
//          are also within 10% of target.
//   Track  is three equal parts: weigh-in today, a meal logged today, and a
//          check-in in the last 7 days.

const DAY_MS = 86400000;

/** Calendar-day key in local time, e.g. "Sat Oct 17 2026". */
export const dayKey = (ms) => new Date(ms).toDateString();

/** The `date` string the nutrition log uses, e.g. "Oct 17". */
export const nutritionDate = (ms) => new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const clamp01 = (x) => Math.max(0, Math.min(1, Number.isFinite(x) ? x : 0));

/** Working sets with reps logged in one history entry. */
export function setsDone(entry) {
  return (entry?.completedExercises || []).reduce(
    (n, ex) => n + (ex.loggedSets || []).filter((s) => Number(s.reps) > 0).length,
    0,
  );
}

/** Planned working sets for one program day. */
export function plannedSets(program, dayKeyName) {
  const exercises = program?.[dayKeyName]?.exercises || [];
  return exercises.reduce((n, ex) => n + (Number(ex.sets ?? ex.targetSets) || 0), 0);
}

/** The schedule day after the last one logged, so the split rotates instead of following a calendar. */
export function nextSessionDay(schedule, history) {
  if (!schedule?.length) return null;
  const last = [...(history || [])].reverse().find((h) => h.dayKey);
  if (!last) return schedule[0];
  const i = schedule.findIndex((d) => d.key === last.dayKey);
  return schedule[(i + 1) % schedule.length] ?? schedule[0];
}

export function computeTrain({ day, trainingState, splitDef }) {
  const history = trainingState?.history || [];
  if (!trainingState || !splitDef) {
    return { fraction: 0, closed: false, setUp: false, label: "Set up training", detail: "Pick a split to start" };
  }
  const today = history.filter((h) => dayKey(h.ts) === dayKey(day));
  const frequency = splitDef.frequency || 4;
  const weekSessions = history.filter((h) => h.ts > day - 7 * DAY_MS && h.ts <= day + DAY_MS).length;

  if (today.length) {
    const done = today.reduce((n, h) => n + setsDone(h), 0);
    const planned = today.reduce((n, h) => n + (plannedSets(trainingState.program, h.dayKey) || 0), 0) || done;
    const fraction = planned ? clamp01(done / planned) : 1;
    return { fraction, closed: fraction >= 1, setUp: true, restDay: false, done, planned, label: `${done} of ${planned} sets`, detail: "Trained today" };
  }
  if (weekSessions >= frequency) {
    return { fraction: 1, closed: true, setUp: true, restDay: true, label: "Rest day", detail: `${weekSessions} of ${frequency} sessions this week` };
  }
  return { fraction: 0, closed: false, setUp: true, restDay: false, label: "Not trained yet", detail: `${weekSessions} of ${frequency} sessions this week` };
}

export function computeFuel({ day, nutLogs, targets }) {
  const date = nutritionDate(day);
  const logs = (nutLogs || []).filter((l) => l.date === date);
  const protein = Math.round(logs.reduce((n, l) => n + (l.totals?.protein_g || 0), 0));
  const calories = Math.round(logs.reduce((n, l) => n + (l.totals?.calories || 0), 0));
  const proteinTarget = Math.round(targets?.p || 0);
  const calTarget = Math.round(targets?.cal || 0);
  const calOk = calTarget > 0 && Math.abs(calories - calTarget) / calTarget <= 0.1;
  const fraction = proteinTarget ? clamp01(protein / proteinTarget) : 0;
  const closed = proteinTarget > 0 && protein >= proteinTarget && calOk;
  return { fraction, closed, protein, proteinTarget, calories, calTarget, calOk, meals: logs.length, label: `${protein} of ${proteinTarget} g` };
}

export function computeTrack({ day, weightLog, nutLogs, lastCheckInTs }) {
  const weighIn = (weightLog || []).some((e) => dayKey(e.ts) === dayKey(day));
  const meals = (nutLogs || []).some((l) => l.date === nutritionDate(day));
  const checkIn = typeof lastCheckInTs === "number" && lastCheckInTs <= day + DAY_MS && day - lastCheckInTs < 7 * DAY_MS;
  const count = [weighIn, meals, checkIn].filter(Boolean).length;
  return { fraction: count / 3, closed: count === 3, parts: { weighIn, meals, checkIn }, label: `${count} of 3 logged` };
}

export function computeRings(args) {
  const train = computeTrain(args);
  const fuel = computeFuel(args);
  const track = computeTrack(args);
  return { train, fuel, track, allClosed: train.closed && fuel.closed && track.closed };
}

/** The last `days` days, oldest first, for the week strip under the rings. */
export function ringHistory(args, days = 7) {
  return Array.from({ length: days }, (_, i) => {
    const day = args.day - (days - 1 - i) * DAY_MS;
    return { day, ...computeRings({ ...args, day }) };
  });
}

/**
 * The one thing most worth doing right now. Replaces the weigh-in banner, the
 * auto-opening check-in sheet and the setup prompt.
 */
export function nextAction({ rings, liveSession, nextDay, lastCheckInTs, firstSeenTs, now }) {
  if (liveSession?.startedAt) {
    return { kind: "resume", title: "Resume your session", detail: "Your workout is still running.", cta: "Resume" };
  }
  if (!rings.train.setUp) {
    return { kind: "setup", title: "Set up your training", detail: "Choose a split and Apex builds your program.", cta: "Choose a split" };
  }
  if (!rings.track.parts.weighIn) {
    return { kind: "weigh", title: "Log today's weigh-in", detail: "Daily weigh-ins keep your trend and targets accurate.", cta: "Log weight" };
  }
  if (!rings.train.closed && !rings.train.done && nextDay) {
    return { kind: "train", title: `Start ${nextDay.tag}`, detail: rings.train.detail, cta: `Start ${nextDay.tag}` };
  }
  const daysSinceCheckIn = typeof lastCheckInTs === "number" ? (now - lastCheckInTs) / DAY_MS : Infinity;
  const accountDays = typeof firstSeenTs === "number" ? (now - firstSeenTs) / DAY_MS : 0;
  if (daysSinceCheckIn >= 7 && accountDays >= 7) {
    return { kind: "checkin", title: "Weekly check-in", detail: "Ten seconds on sleep, stress and energy keeps your plan tuned.", cta: "Check in" };
  }
  if (!rings.fuel.closed && rings.fuel.proteinTarget > 0) {
    const left = Math.max(0, rings.fuel.proteinTarget - rings.fuel.protein);
    return left > 0
      ? { kind: "fuel", title: `${left} g protein to go`, detail: "Log your next meal to close Fuel.", cta: "Log a meal" }
      : { kind: "fuel", title: "Protein done", detail: `Calories at ${rings.fuel.calories} of ${rings.fuel.calTarget}. Land within 10% to close Fuel.`, cta: "Open nutrition" };
  }
  if (rings.allClosed) {
    return { kind: "done", title: "All three rings closed", detail: "That's the day. Recover well.", cta: null };
  }
  return { kind: "track", title: "Finish today's log", detail: rings.track.label, cta: null };
}
