import { describe, expect, it } from "vitest";
import { e1rmSeries, effortLabel, findPRs, parseRepRange, restSecondsFor, sessionVolume, suggestNextLoad, summarizeSession } from "./workout.js";

const set = (weight, reps) => ({ weight: String(weight), reps: String(reps) });
const bench = { id: "b", name: "Bench Press", muscle: "chest", category: "compound", repRange: "6–10" };
const squat = { id: "s", name: "Squat", muscle: "quads", category: "compound", repRange: "6–10" };

describe("rep ranges", () => {
  it("reads en dashes, hyphens, single numbers and mixed schemes", () => {
    expect(parseRepRange("6–10")).toEqual({ min: 6, max: 10 });
    expect(parseRepRange("10-15")).toEqual({ min: 10, max: 15 });
    expect(parseRepRange("8")).toEqual({ min: 8, max: 8 });
    expect(parseRepRange("1×2–5, 2×3–8")).toEqual({ min: 3, max: 8 });
    expect(parseRepRange("")).toBeNull();
  });
});

describe("next-session load", () => {
  it("adds 5 lb when every set reaches the top of the range", () => {
    expect(suggestNextLoad(bench, [set(185, 10), set(185, 10), set(185, 11)])).toMatchObject({ kind: "up", increment: 5, weight: 190 });
  });

  it("adds 10 lb for lower-body compounds", () => {
    expect(suggestNextLoad(squat, [set(225, 10), set(225, 10)])).toMatchObject({ kind: "up", increment: 10, text: "+10 lb next time" });
  });

  it("keeps the weight and chases reps inside the range", () => {
    expect(suggestNextLoad(bench, [set(185, 10), set(185, 8)])).toMatchObject({ kind: "reps", text: "Same weight, chase 10 reps" });
  });

  it("holds when a set falls below the bottom of the range", () => {
    expect(suggestNextLoad(bench, [set(185, 7), set(185, 5)]).kind).toBe("hold");
  });

  it("ignores half-filled sets and says nothing without data", () => {
    expect(suggestNextLoad(bench, [{ weight: "185", reps: "" }])).toBeNull();
  });
});

describe("volume and records", () => {
  it("sums weight × reps over completed sets only", () => {
    expect(sessionVolume([{ loggedSets: [set(100, 10), set(100, 8), { weight: "100", reps: "" }] }])).toBe(1800);
  });

  it("flags a record only when the estimated 1-rep max beats every earlier session", () => {
    const prior = [{ completedExercises: [{ name: "Bench Press", loggedSets: [set(185, 8)] }] }]; // e1RM 234
    expect(findPRs([{ name: "Bench Press", loggedSets: [set(195, 8)] }], prior)).toMatchObject([{ name: "Bench Press", e1rm: 247, previous: 234 }]);
    expect(findPRs([{ name: "Bench Press", loggedSets: [set(185, 7)] }], prior)).toEqual([]);
  });

  it("treats a first-ever lift as a baseline, not a record", () => {
    expect(findPRs([{ name: "Squat", loggedSets: [set(225, 5)] }], [])).toEqual([]);
  });
});

describe("rest and effort", () => {
  it("rests longer on compounds, longest on lower body", () => {
    expect(restSecondsFor(squat)).toBe(180);
    expect(restSecondsFor(bench)).toBe(150);
    expect(restSecondsFor({ category: "isolation" })).toBe(90);
  });

  it("labels effort like Apple Watch", () => {
    expect([2, 5, 8, 10].map(effortLabel)).toEqual(["Easy", "Moderate", "Hard", "All out"]);
  });
});

describe("session summary", () => {
  it("collects time, sets, volume, records and next-time changes", () => {
    const result = {
      duration: 3120,
      effort: 8,
      completedExercises: [
        { id: "b", name: "Bench Press", loggedSets: [set(195, 10), set(195, 10)] },
        { id: "s", name: "Squat", loggedSets: [set(225, 7)] },
      ],
    };
    const prior = [{ completedExercises: [{ name: "Bench Press", loggedSets: [set(185, 10)] }] }];
    const s = summarizeSession(result, prior, { exercises: [bench, squat] });
    expect(s).toMatchObject({ minutes: 52, sets: 3, volume: 5475, effort: 8 });
    expect(s.prs.map((p) => p.name)).toEqual(["Bench Press"]);
    expect(s.next).toEqual([
      expect.objectContaining({ name: "Bench Press", kind: "up", text: "+5 lb next time" }),
      expect.objectContaining({ name: "Squat", kind: "reps" }),
    ]);
  });
});

describe("exercise history", () => {
  it("returns each session's best estimated 1-rep max for one lift, oldest first", () => {
    const history = [
      { ts: 3, completedExercises: [{ name: "Bench Press", loggedSets: [set(195, 8)] }] },
      { ts: 1, completedExercises: [{ name: "Bench Press", loggedSets: [set(185, 8), set(185, 6)] }] },
      { ts: 2, completedExercises: [{ name: "Squat", loggedSets: [set(225, 5)] }] },
    ];
    expect(e1rmSeries(history, "Bench Press")).toEqual([{ ts: 1, e1rm: 234 }, { ts: 3, e1rm: 247 }]);
    expect(e1rmSeries(history, "Deadlift")).toEqual([]);
  });
});
