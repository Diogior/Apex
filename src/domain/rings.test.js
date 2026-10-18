import { describe, expect, it } from "vitest";
import { computeFuel, computeRings, computeTrack, computeTrain, nextAction, nextSessionDay, nutritionDate, ringHistory } from "./rings.js";
import { SPLITS } from "./training.js";

const DAY = 86400000;
const now = new Date(2026, 9, 17, 18, 0).getTime();
const split = SPLITS.ul; // 4 days a week
const program = { upper1: { exercises: [{ sets: 3 }, { sets: 3 }] }, lower1: { exercises: [{ sets: 4 }] } };
const session = (ts, dayKey, sets) => ({ ts, dayKey, completedExercises: [{ name: "Bench Press", loggedSets: Array.from({ length: sets }, () => ({ reps: 8, weight: 100 })) }] });
const meal = (ms, protein, calories) => ({ date: nutritionDate(ms), totals: { protein_g: protein, calories } });

describe("Train ring", () => {
  it("asks for setup when there is no training state", () => {
    expect(computeTrain({ day: now, trainingState: null, splitDef: split })).toMatchObject({ setUp: false, closed: false });
  });

  it("measures today's sets against the plan", () => {
    const t = computeTrain({ day: now, trainingState: { program, history: [session(now - 3600e3, "upper1", 3)] }, splitDef: split });
    expect(t).toMatchObject({ done: 3, planned: 6, fraction: 0.5, closed: false });
  });

  it("closes when today's planned sets are done", () => {
    const t = computeTrain({ day: now, trainingState: { program, history: [session(now - 3600e3, "upper1", 6)] }, splitDef: split });
    expect(t.closed).toBe(true);
  });

  it("treats today as a rest day once the week's sessions are in", () => {
    const history = [1, 2, 3, 4].map((d) => session(now - d * DAY, "upper1", 6));
    const t = computeTrain({ day: now, trainingState: { program, history }, splitDef: split });
    expect(t).toMatchObject({ restDay: true, closed: true, label: "Rest day" });
  });

  it("stays open mid-week with sessions still to do", () => {
    const t = computeTrain({ day: now, trainingState: { program, history: [session(now - 2 * DAY, "upper1", 6)] }, splitDef: split });
    expect(t).toMatchObject({ closed: false, detail: "1 of 4 sessions this week" });
  });

  it("rotates to the day after the last one logged", () => {
    expect(nextSessionDay(split.schedule, []).key).toBe("upper1");
    expect(nextSessionDay(split.schedule, [session(now, "upper1", 3)]).key).toBe("lower1");
    expect(nextSessionDay(split.schedule, [session(now, "lower2", 3)]).key).toBe("upper1");
  });
});

describe("Fuel ring", () => {
  const targets = { p: 200, cal: 2800 };

  it("fills with protein", () => {
    const f = computeFuel({ day: now, nutLogs: [meal(now, 50, 700), meal(now, 50, 600)], targets });
    expect(f).toMatchObject({ protein: 100, fraction: 0.5, closed: false });
  });

  it("only closes when calories land within 10% too", () => {
    expect(computeFuel({ day: now, nutLogs: [meal(now, 210, 2000)], targets }).closed).toBe(false);
    expect(computeFuel({ day: now, nutLogs: [meal(now, 210, 2700)], targets }).closed).toBe(true);
  });

  it("ignores other days' meals", () => {
    expect(computeFuel({ day: now, nutLogs: [meal(now - DAY, 200, 2800)], targets }).protein).toBe(0);
  });
});

describe("Track ring", () => {
  it("counts weigh-in, meals and a recent check-in as thirds", () => {
    const t = computeTrack({ day: now, weightLog: [{ ts: now - 3600e3, weight: 182 }], nutLogs: [meal(now, 30, 400)], lastCheckInTs: now - 8 * DAY });
    expect(t.parts).toEqual({ weighIn: true, meals: true, checkIn: false });
    expect(t.fraction).toBeCloseTo(2 / 3);
  });

  it("closes with all three", () => {
    const t = computeTrack({ day: now, weightLog: [{ ts: now, weight: 182 }], nutLogs: [meal(now, 30, 400)], lastCheckInTs: now - 2 * DAY });
    expect(t.closed).toBe(true);
  });
});

describe("ring history", () => {
  it("returns seven days, oldest first, ending today", () => {
    const h = ringHistory({ day: now, trainingState: { program, history: [] }, splitDef: split, nutLogs: [], weightLog: [], targets: { p: 200, cal: 2800 } });
    expect(h).toHaveLength(7);
    expect(new Date(h[6].day).getDate()).toBe(17);
    expect(new Date(h[0].day).getDate()).toBe(11);
  });
});

describe("next action", () => {
  const base = { day: now, trainingState: { program, history: [] }, splitDef: split, nutLogs: [], weightLog: [], targets: { p: 200, cal: 2800 } };
  const act = (over = {}, ctx = {}) => {
    const args = { ...base, ...over };
    return nextAction({ rings: computeRings(args), nextDay: nextSessionDay(split.schedule, args.trainingState?.history), now, firstSeenTs: now - 30 * DAY, ...ctx });
  };

  it("resumes a running session first", () => {
    expect(act({}, { liveSession: { startedAt: now } }).kind).toBe("resume");
  });

  it("asks for setup before anything else", () => {
    expect(act({ trainingState: null }).kind).toBe("setup");
  });

  it("asks for the weigh-in, then the session", () => {
    expect(act().kind).toBe("weigh");
    const weighed = { weightLog: [{ ts: now, weight: 182 }] };
    expect(act(weighed)).toMatchObject({ kind: "train", title: "Start Upper A" });
  });

  it("doesn't ask new users for a check-in in their first week", () => {
    const done = { weightLog: [{ ts: now, weight: 182 }], trainingState: { program, history: [session(now, "upper1", 6)] } };
    expect(act(done, { firstSeenTs: now - 2 * DAY }).kind).toBe("fuel");
    expect(act(done, { firstSeenTs: now - 10 * DAY }).kind).toBe("checkin");
  });
});
