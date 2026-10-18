import { describe, expect, it } from "vitest";
import { computeTrends, rateInfoForGoal, topLift, weeklyRate, weightCorridor } from "./trends.js";
import { computeAwards, countPRs } from "./awards.js";
import { nutritionDate } from "./rings.js";

const DAY = 86400000;
const now = new Date(2026, 9, 18, 12).getTime();
const set = (w, r) => ({ weight: String(w), reps: String(r) });
const session = (daysAgo, sets = 4, lift = "Bench Press", weight = 185) => ({
  ts: now - daysAgo * DAY,
  completedExercises: [{ name: lift, loggedSets: Array.from({ length: sets }, () => set(weight, 8)) }],
});

describe("weight trend", () => {
  it("maps Apex goals onto the engine's rate bands", () => {
    expect(rateInfoForGoal("maintain")).toMatchObject({ min: -0.25, max: 0.25 });
    expect(rateInfoForGoal("bulk")).toMatchObject({ min: 0.25, max: 0.75 });
  });

  it("fits a weekly rate from weigh-ins", () => {
    const log = Array.from({ length: 14 }, (_, i) => ({ ts: now - (13 - i) * DAY, weight: 180 + i * 0.1 }));
    expect(weeklyRate(log, now - 14 * DAY, now)).toBeCloseTo(0.7, 2);
    expect(weeklyRate(log.slice(0, 2), 0, now)).toBeNull();
  });

  it("builds a corridor that widens with time from the first weigh-in", () => {
    const c = weightCorridor([{ x: now - 14 * DAY, y: 180 }, { x: now, y: 181 }], "bulk");
    expect(c[0]).toEqual({ x: now - 14 * DAY, lo: 180, hi: 180 });
    expect(c[1].lo).toBeCloseTo(180.5);
    expect(c[1].hi).toBeCloseTo(181.5);
  });
});

describe("trends", () => {
  it("judges weight change against the goal band", () => {
    const log = Array.from({ length: 14 }, (_, i) => ({ ts: now - (13 - i) * DAY, weight: 180 + i * 0.07 }));
    const w = computeTrends({ now, weightLog: log, goal: "bulk" }).find((t) => t.id === "weight");
    expect(w).toMatchObject({ value: 0.49, direction: "up", good: true });
    const cut = computeTrends({ now, weightLog: log, goal: "cut" }).find((t) => t.id === "weight");
    expect(cut.good).toBe(false);
  });

  it("compares this week's training with the 90-day weekly average", () => {
    const history = [...Array.from({ length: 12 }, (_, i) => session(8 + i * 5)), session(1), session(3), session(5), session(6)];
    const t = computeTrends({ now, history });
    const sessions = t.find((x) => x.id === "sessions");
    expect(sessions.value).toBe(4);
    expect(sessions.direction).toBe("up");
    expect(t.find((x) => x.id === "sets").value).toBe(16);
  });

  it("holds back baselines until there are two weeks of data", () => {
    const t = computeTrends({ now, history: [session(1), session(2)] });
    expect(t.find((x) => x.id === "sessions")).toMatchObject({ baseline: null, direction: "flat" });
  });

  it("tracks protein as a share of target on logged days", () => {
    const nutLogs = [0, 1, 2].map((d) => ({ date: nutritionDate(now - d * DAY), totals: { protein_g: 180 } }));
    expect(computeTrends({ now, nutLogs, proteinTarget: 200 }).find((t) => t.id === "protein").value).toBe(90);
  });

  it("follows the most-logged lift's estimated 1-rep max", () => {
    const history = [session(40, 3, "Bench Press", 175), session(20, 3, "Bench Press", 180), session(2, 3, "Bench Press", 195), session(3, 3, "Squat", 225)];
    expect(topLift(history)).toBe("Bench Press");
    const s = computeTrends({ now, history }).find((t) => t.id === "strength");
    expect(s).toMatchObject({ label: "Bench Press", value: 247, direction: "up", good: true });
  });
});

describe("awards", () => {
  it("counts personal records, ignoring first-ever lifts", () => {
    expect(countPRs([session(10, 1, "Bench Press", 185), session(5, 1, "Bench Press", 195), session(1, 1, "Bench Press", 190)])).toBe(1);
  });

  it("earns milestones and shows the next one with progress", () => {
    const history = Array.from({ length: 12 }, (_, i) => session(i));
    const a = computeAwards({ history, now, frequency: 4 });
    expect(a.earned.map((e) => e.id)).toEqual(expect.arrayContaining(["first-workout", "sessions-10"]));
    expect(a.next.find((n) => n.id === "sessions-25")).toMatchObject({ current: 12, progress: 12 / 25 });
  });

  it("sizes the monthly challenge to the split", () => {
    const a = computeAwards({ history: [session(0), session(2)], now, frequency: 4 });
    expect(a.challenge).toMatchObject({ target: 18, current: 2, earned: false }); // October: 31 days
  });

  it("awards perfect days when all rings closed", () => {
    const a = computeAwards({ ringDays: [{ allClosed: true }, { allClosed: false }, { allClosed: true }], now });
    expect(a.earned.find((e) => e.id === "perfect-day").title).toBe("2 perfect days");
  });
});
