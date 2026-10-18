import { describe, expect, it } from "vitest";
import { computeMuscleVolume, generateProgram, resolveExerciseTag, runAdaptation, SPLITS, VOL } from "./training.js";

const day = 86400000;
const sets = (n, weight = 100, reps = 8, rpe) => Array.from({ length: n }, () => ({ weight, reps, ...(rpe ? { rpe } : {}) }));

describe("exercise tagging", () => {
  it("finds the target muscle from an exercise name it has never seen", () => {
    expect(resolveExerciseTag("Smith Machine Incline Bench")?.primary).toBe("chest");
    expect(resolveExerciseTag("Seated Leg Curl")?.primary).toBe("hams");
  });
});

describe("weekly volume per muscle", () => {
  it("counts working sets for the primary muscle and half sets for secondary muscles", () => {
    const history = [
      {
        ts: Date.now() - day,
        completedExercises: [{ name: "Barbell Row", loggedSets: sets(4) }],
      },
    ];
    const vol = computeMuscleVolume(history);
    expect(vol.back.sets).toBe(4);
    expect(vol.back.freq).toBe(1);
    expect(vol.biceps.sets).toBe(2);
  });

  it("ignores sessions outside the window and sets with no reps", () => {
    const history = [
      { ts: Date.now() - 10 * day, completedExercises: [{ name: "Barbell Row", loggedSets: sets(4) }] },
      { ts: Date.now() - day, completedExercises: [{ name: "Barbell Row", loggedSets: [{ weight: 100, reps: 0 }] }] },
    ];
    expect(computeMuscleVolume(history).back.sets).toBe(0);
  });
});

describe("program generation", () => {
  it("builds every day of every split", () => {
    for (const split of Object.keys(SPLITS)) {
      const program = generateProgram({ split, level: "intermediate", goal: "bulk" });
      for (const d of SPLITS[split].schedule) {
        expect(program[d.key]?.exercises.length, `${split}/${d.key}`).toBeGreaterThan(0)
      }
    }
  });

  it("keeps generated set counts between 2 and 5", () => {
    const program = generateProgram({ split: "ul", level: "competitor", goal: "bulk" });
    const all = Object.values(program).flatMap((d) => d.exercises)
    expect(all.every((e) => e.sets >= 2 && e.sets <= 5)).toBe(true);
  });

  it("adds a set for a lagging muscle", () => {
    const base = generateProgram({ split: "ul", level: "intermediate", goal: "bulk" });
    const boosted = generateProgram({ split: "ul", level: "intermediate", goal: "bulk", neglectedMuscles: ["chest"] });
    const chest = (p) => p.upper1.exercises.find((e) => e.muscle === "chest" && e.category === "compound");
    expect(chest(boosted).sets).toBe(Math.min(5, chest(base).sets + 1));
  });

  it("has volume landmarks in the right order for every level", () => {
    for (const v of Object.values(VOL)) {
      expect(v.mev).toBeLessThanOrEqual(v.mav);
      expect(v.mav).toBeLessThanOrEqual(v.mrv);
    }
  });
});

describe("adaptation", () => {
  const session = (dayKey, ts, weight, effort) => ({ dayKey, ts, ...(effort ? { effort } : {}), completedExercises: [{ name: "Bench Press", loggedSets: sets(3, weight, 8) }] });

  it("waits for at least two sessions", () => {
    expect(runAdaptation({ program: {}, history: [session("push1", 1, 100, 7)], level: "intermediate" }).signal).toBe("neutral");
  });

  it("adds a set when volume climbs and effort is manageable", () => {
    const r = runAdaptation({ program: {}, history: [session("push1", 1, 100, 7), session("push1", 2, 110, 7)], level: "intermediate" });
    expect(r.adjustments.push1).toMatchObject({ signal: "progress", setDelta: 1, lastEffort: 7 });
  });

  it("still progresses on volume when the session wasn't rated", () => {
    const r = runAdaptation({ program: {}, history: [session("push1", 1, 100), session("push1", 2, 110)], level: "intermediate" });
    expect(r.adjustments.push1).toMatchObject({ signal: "progress", lastEffort: null });
  });

  it("pulls back a set after an all-out session, even if volume rose", () => {
    const r = runAdaptation({ program: {}, history: [session("push1", 1, 100, 7), session("push1", 2, 110, 9)], level: "intermediate" });
    expect(r.adjustments.push1).toMatchObject({ signal: "fatigue", setDelta: -1 });
    expect(r.signal).toBe("fatigue");
  });

  it("pulls back when volume drops by more than 10%", () => {
    const r = runAdaptation({ program: {}, history: [session("push1", 1, 100, 6), session("push1", 2, 85, 6)], level: "intermediate" });
    expect(r.adjustments.push1.signal).toBe("fatigue");
  });

  it("ignores per-set SFR values when judging fatigue", () => {
    const sfrSession = (ts, weight) => ({ dayKey: "push1", ts, completedExercises: [{ name: "Bench Press", loggedSets: sets(3, weight, 8, 2) }] });
    const r = runAdaptation({ program: {}, history: [sfrSession(1, 100), sfrSession(2, 110)], level: "intermediate" });
    expect(r.adjustments.push1.signal).toBe("progress");
  });
});
