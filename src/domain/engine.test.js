import { describe, expect, it, vi, afterEach } from "vitest";
import {
  analyzeWeightTrend,
  calcProtocol,
  classifyRate,
  computeBMR,
  computeBodyComp,
  computeGoalConfig,
  computeE1RM,
  computeTDEE,
  computeWeighInStreak,
  getGoalRateInfo,
  linearRegression,
} from "./engine.js";

// Height is stored in inches, weight in pounds.
const male = { weight: 180, height: 70, age: 26, sex: "male", level: "intermediate", activity: "moderately_active" };

describe("linearRegression", () => {
  it("recovers a perfect line", () => {
    const r = linearRegression([{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 }]);
    expect(r.slope).toBeCloseTo(2);
    expect(r.intercept).toBeCloseTo(1);
    expect(r.r2).toBeCloseTo(1);
  });

  it("is flat with fewer than two points or no spread in x", () => {
    expect(linearRegression([{ x: 0, y: 4 }])).toEqual({ slope: 0, intercept: 4, r2: 0 });
    expect(linearRegression([{ x: 1, y: 2 }, { x: 1, y: 4 }]).slope).toBe(0);
  });
});

describe("body composition and energy", () => {
  it("estimates BMI and body fat from the Deurenberg formula with a training-age adjustment", () => {
    const bc = computeBodyComp(male);
    // 180 lb = 81.6 kg; 70 in = 1.778 m; BMI 25.8
    expect(bc.weightKg).toBe(81.6);
    expect(bc.bmi).toBe(25.8);
    // 1.2 * 25.83 + 0.23 * 26 - 16.2 = 20.8, minus 2 for intermediate = 18.8
    expect(bc.bfPct).toBe(18.8);
  });

  it("clamps body fat to a sane range", () => {
    expect(computeBodyComp({ ...male, weight: 400, age: 80, level: "beginner" }).bfPct).toBe(45);
  });

  it("uses Mifflin-St Jeor for BMR", () => {
    // 10 * 81.6 + 6.25 * 177.8 - 5 * 26 + 5 = 1802.25
    expect(computeBMR(male)).toBe(1802);
    // Same person, female constant (-161 instead of +5)
    expect(computeBMR({ ...male, sex: "female" })).toBe(1636);
  });

  it("multiplies BMR by the chosen activity level", () => {
    const { tdee, pal } = computeTDEE(male, 1802);
    expect(pal).toBe(1.55);
    expect(tdee).toBe(Math.round(1802 * 1.55));
  });

  it("adds a premium for very muscular athletes (FFMI over 24)", () => {
    const big = { ...male, weight: 230, level: "competitor" };
    const { tdee, pal } = computeTDEE(big, 2000);
    expect(tdee).toBe(Math.round(2000 * pal * 1.08));
  });
});

describe("rate of change", () => {
  it("knows each goal's healthy band", () => {
    expect(getGoalRateInfo("bulk")).toMatchObject({ min: 0.25, max: 0.75, dir: 1 });
    expect(getGoalRateInfo("unknown")).toBeNull();
  });

  it("grades a bulk", () => {
    const info = getGoalRateInfo("bulk");
    expect(classifyRate(0.5, info).label).toBe("On track");
    expect(classifyRate(0.1, info).label).toBe("Too slow");
    expect(classifyRate(1.1, info).label).toBe("Too fast");
  });

  it("grades a cut, where losing faster is more negative", () => {
    const info = getGoalRateInfo("cut");
    expect(classifyRate(-0.75, info).label).toBe("On track");
    expect(classifyRate(-0.2, info).label).toBe("Too slow");
    expect(classifyRate(-1.4, info).label).toBe("Too fast");
  });

  it("measures a weekly trend from daily weigh-ins", () => {
    const day = 86400000;
    const now = Date.now();
    // Gaining 0.1 lb a day = 0.7 lb a week
    const log = Array.from({ length: 10 }, (_, i) => ({ ts: now - (9 - i) * day, weight: 180 + i * 0.1 }));
    const t = analyzeWeightTrend(log);
    expect(t.rate).toBeCloseTo(0.7, 2);
    expect(t.classification).toBe("gaining_moderate");
    expect(t.confidence).toBeCloseTo(1, 2);
  });

  it("refuses to guess a trend from fewer than three weigh-ins", () => {
    expect(analyzeWeightTrend([{ ts: 1, weight: 180 }]).classification).toBe("insufficient_data");
  });
});

describe("strength", () => {
  it("estimates a one-rep max with Epley", () => {
    // 225 x 5 -> 225 * (1 + 5/30) = 262.5
    expect(computeE1RM(225, 5)).toBe(263);
    expect(computeE1RM(0, 5)).toBe(0);
  });
});

describe("weigh-in streak", () => {
  afterEach(() => vi.useRealTimers());

  it("counts consecutive days ending today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 14, 9, 0));
    const day = 86400000;
    const now = Date.now();
    const log = [0, 1, 2, 4].map((d) => ({ ts: now - d * day, weight: 180 }));
    const s = computeWeighInStreak(log);
    expect(s.loggedToday).toBe(true);
    expect(s.current).toBe(3);
    expect(s.urgency).toBe("none");
  });

  it("raises urgency the longer the gap", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 14, 9, 0));
    const s = computeWeighInStreak([{ ts: Date.now() - 4 * 86400000, weight: 180 }]);
    expect(s.loggedToday).toBe(false);
    expect(s.urgency).toBe("danger");
  });
});

describe("post-show protocol calculator", () => {
  // Regression: calcProtocol referenced a colour object that didn't exist at module
  // level, so the calculator threw "C is not defined" whenever it ran.
  it("runs for both modes without throwing", () => {
    for (const mode of ["reverse", "maintenance"]) {
      const proto = calcProtocol({ stageWeight: "175", stageCalories: "1800", prepWeeks: "16", sex: "male", mode });
      expect(proto).toBeTruthy();
    }
  });
});

describe("measured body fat", () => {
  it("uses a scanned or entered body fat instead of the BMI estimate", () => {
    expect(computeBodyComp({ ...male, bfPct: 12 }).bfPct).toBe(12);
    expect(computeBodyComp({ ...male, bfPct: "14.5" }).bfPct).toBe(14.5);
  });

  it("ignores missing or impossible values", () => {
    expect(computeBodyComp({ ...male, bfPct: null }).bfPct).toBe(18.8);
    expect(computeBodyComp({ ...male, bfPct: 90 }).bfPct).toBe(18.8);
  });

  it("recalibrates goal targets from the measured value and current weight", () => {
    const estimated = computeGoalConfig({ ...male, goal: "cut" });
    const scanned = computeGoalConfig({ ...male, goal: "cut", bfPct: 14, weight: 176 });
    expect(scanned.startBfPct).toBe(14);
    expect(scanned.startWeight).toBeCloseTo(176, 0); // round-trips through kg
    expect(scanned.effectiveGoalWeight).not.toBe(estimated.effectiveGoalWeight);
  });
});
