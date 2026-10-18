// Apex algorithm engine: body composition, energy, goal pacing and protocol decisions.
// Moved out of App.jsx in Phase 0.

import { getCanvasC } from "../styles/theme.js";

// ─── CALCULATOR ───────────────────────────────────────────────────────────────

export function calcProtocol({stageWeight, stageCalories, prepWeeks, sex, mode}) {
  const C = getCanvasC(); // read the live theme at call time; there is no module-level C
  const w = parseFloat(stageWeight), cal = parseFloat(stageCalories), wks = parseInt(prepWeeks)||16;
  const male = sex !== "female";
  const ceilF = male ? .10 : .08;
  const ceiling = Math.round(w*(1+ceilF));
  const target = Math.round(w*(1+ceilF*.72));
  const sev = Math.min(wks/20, 1);
  const mainCals = Math.round(target*(male?16.5:14.5));
  const surplusCals = Math.round(mainCals*(male?1.07:1.05));
  const rdBase = Math.round(cal+175);

  const mk = (cals,pLb,fPct,bw) => {
    const p=Math.round(bw*pLb), f=Math.round(cals*fPct/9), c=Math.max(0,Math.round((cals-p*4-f*9)/4));
    return {cals,p,c,f};
  };

  const phases = mode==="maintenance" ? [
    {key:"p1",dot:"p1",icon:"01",label:"Day 1–7",name:"Land at maintenance",color:C.green,
      ...mk(mainCals,1.1,.24,target),
      desc:`Hit ${mainCals} kcal immediately — this is your full calculated TDEE for your target offseason weight. Insulin sensitivity is elevated post-prep, so even this surplus-free intake drives glycogen restoration faster than expected. Expect 2–4 lbs in 72 hours — that's glycogen, not fat.`},
    {key:"p2",dot:"p2",icon:"02",label:"Week 2–4",name:"Stabilize & calibrate",color:C.accentInk,
      ...mk(mainCals,1.0,.25,target),
      desc:`Hold maintenance for 3 full weeks to lock in your metabolic set point at the new bodyweight. 7-day weight average should be flat (±0.5 lbs). Gaining faster? Trim 100–150 kcals from carbs only. Losing? Add 100. The goal is a flat trendline at your target offseason weight.`},
    {key:"p3",dot:"p3",icon:"03",label:"Week 5–12",name:"Anabolic window surplus",color:C.purple,
      ...mk(surplusCals,1.0,.25,target),
      desc:`Now enter a controlled lean surplus — ${surplusCals} kcal. Hormones are recovering, insulin sensitivity is still elevated, body is primed to partition nutrients toward muscle. Push training intensity hard. Acceptable gain rate: 0.3–0.5 lbs/wk. This is where post-show growth actually happens.`},
    {key:"p4",dot:"p4",icon:"04",label:"Week 13+",name:"Sustained offseason",color:C.blue,
      ...mk(surplusCals,1.0,.25,target),
      desc:`Hold your lean surplus through the offseason. Monitor the ${ceiling} lb ceiling — don't cross it. When you're 12–16 weeks out from your next show, drop to maintenance for 2 weeks, then enter prep. No cleanup phase. You're already stage-ready lean.`},
  ] : [
    {key:"p1",dot:"p1",icon:"01",label:"Week 1–2",name:"Metabolic reset",color:C.purple,
      ...mk(rdBase,1.2,.22,w),
      desc:"Do NOT jump calories. Your metabolism is suppressed and insulin sensitivity is sky-high. Every single calorie is working harder than it ever did during prep — use that."},
    {key:"p2",dot:"p2",icon:"02",label:"Week 3–6",name:"Reverse diet ramp",color:C.accentInk,
      ...mk(Math.round(rdBase+380),1.0,.23,target),
      desc:"Add +100 kcal every 7 days — primarily carbohydrates. Gaining more than 1 lb/wk? Pull back 100 kcals. The slower you go here, the leaner your offseason will be."},
    {key:"p3",dot:"p3",icon:"03",label:"Week 7–12",name:"Anabolic window",color:C.green,
      ...mk(Math.round(rdBase+860),1.0,.25,target),
      desc:"Peak anabolic sensitivity. Push intensity in training. Add 1–2 refeed days per week. This is where the real offseason muscle is built."},
    {key:"p4",dot:"p4",icon:"04",label:"Week 13+",name:"Sustained offseason",color:C.blue,
      ...mk(Math.round(target*(male?17:15)),1.0,.25,target),
      desc:"Settled offseason TDEE. Weight gain should not exceed 0.3–0.5 lbs/wk. Hold here until 12–16 weeks before your next show — and you walk in already ready."},
  ];

  const vitals = [
    {abbr:"NRG",name:"Energy",wks:Math.round(1+sev*3),pct:Math.max(.2,1-sev*.65)},
    {abbr:"SLP",name:"Sleep Quality",wks:Math.round(2+sev*4),pct:Math.max(.25,1-sev*.55)},
    {abbr:"LIB",name:"Libido",wks:Math.round(4+sev*10),pct:Math.max(.05,1-sev*.9)},
    {abbr:"STR",name:"Strength",wks:Math.round(3+sev*5),pct:Math.max(.3,1-sev*.55)},
    {abbr:"MND",name:"Mood / Focus",wks:Math.round(2+sev*4),pct:Math.max(.25,1-sev*.6)},
    {abbr:"HRM",name:"Hormones",wks:Math.round(4+sev*8),pct:Math.max(.08,1-sev*.88)},
  ];

  const baselineCals = mode==="maintenance" ? mainCals : rdBase;
  return {stageWeight:w,stageCalories:cal,ceiling,target,baselineCals,mainCals,surplusCals,phases,vitals,wks,sev,mode};
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── APEX ALGORITHM ENGINE v1.0 ──────────────────────────────────────────────
// Performance systems architecture: User State → Protocol → Feedback → Decision
// ═══════════════════════════════════════════════════════════════════════════════

// ── UTILITY: Least-squares linear regression ─────────────────────────────────
export function linearRegression(points) {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y || 0, r2: 0 };
  const sumX  = points.reduce((s, p) => s + p.x, 0);
  const sumY  = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = (n * sumX2 - sumX * sumX);
  if (denom === 0) return { slope: 0, intercept: sumY / n, r2: 0 };
  const slope     = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const yMean = sumY / n;
  const ssTot = points.reduce((s, p) => s + (p.y - yMean) ** 2, 0);
  const ssRes = points.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0);
  const r2 = ssTot === 0 ? 0 : Math.max(0, 1 - ssRes / ssTot);
  return { slope, intercept, r2 };
}

// ── SECTION 2: USER STATE MODEL ───────────────────────────────────────────────

export function computeBodyComp(user) {
  const weightLbs = parseFloat(user.weight) || 180;
  const heightCm  = parseFloat(user.height) ? parseFloat(user.height) * 2.54 : 175; // stored in inches
  const age       = parseFloat(user.age)    || 25;
  const sex       = user.sex   || "male";
  const level     = user.level || "intermediate";

  const weightKg = weightLbs * 0.453592;
  const heightM  = heightCm / 100;
  const bmi      = weightKg / (heightM * heightM);

  // Deurenberg BMI-derived BF% — adjusted for training age (muscle inflates BMI)
  let bfPct = sex === "male"
    ? (1.20 * bmi) + (0.23 * age) - 16.2
    : (1.20 * bmi) + (0.23 * age) - 5.4;
  const levelAdj = { beginner: 0, intermediate: -2, advanced: -4, competitor: -5.5 };
  bfPct = Math.max(4, Math.min(45, bfPct + (levelAdj[level] || -2)));

  const lbmKg = weightKg * (1 - bfPct / 100);
  const fatKg = weightKg * (bfPct / 100);
  const ffmi  = lbmKg / (heightM * heightM);

  return {
    bfPct:    Math.round(bfPct * 10) / 10,
    lbmKg:    Math.round(lbmKg * 10) / 10,
    lbmLbs:   Math.round(lbmKg * 2.20462 * 10) / 10,
    fatKg:    Math.round(fatKg * 10) / 10,
    ffmi:     Math.round(ffmi  * 10) / 10,
    weightKg: Math.round(weightKg * 10) / 10,
    bmi:      Math.round(bmi   * 10) / 10,
  };
}

export function computeBMR(user) {
  const { weightKg } = computeBodyComp(user);
  const heightCm = parseFloat(user.height) ? parseFloat(user.height) * 2.54 : 175; // stored in inches
  const age      = parseFloat(user.age)    || 25;
  const sex      = user.sex || "male";
  // Mifflin-St Jeor
  return Math.round(sex === "male"
    ? (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5
    : (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161);
}

export function computeTDEE(user, bmr) {
  const level = user.level || "intermediate";
  // Activity-level PAL (conservative — Mifflin-St Jeor already includes BMR)
  const PAL_MAP = {
    sedentary:        1.25,
    lightly_active:   1.40,
    moderately_active:1.55,
    very_active:      1.70,
    extra_active:     1.90,
  };
  // If user has set activity level use it; otherwise infer from training level
  const INFERRED_PAL = { beginner: 1.40, intermediate: 1.55, advanced: 1.55, competitor: 1.70 };
  const pal = PAL_MAP[user.activity] || INFERRED_PAL[level] || 1.45;

  // FFMI metabolic premium — heavily muscled athletes run hotter
  const { ffmi } = computeBodyComp(user);
  const ffmiMult = ffmi > 24 ? 1.08 : ffmi > 22 ? 1.04 : 1.00;
  // PAL multipliers already include TEF — no separate TEF term needed
  const tdee = Math.round(bmr * pal * ffmiMult);
  return { tdee, pal };
}

export function computeRCS(user, weightLog, checkIn) {
  // checkIn: { sleep, stress, energy, mood } — all optional, fallback to neutral
  let score = 70;
  const sleep  = checkIn?.sleep  ?? 7.0;
  const stress = checkIn?.stress ?? 5;
  const energy = checkIn?.energy ?? 7;

  // Sleep modifier
  if      (sleep >= 8.0) score += 10;
  else if (sleep >= 7.0) score += 5;
  else if (sleep >= 6.0) score += 0;
  else if (sleep >= 5.0) score -= 10;
  else                   score -= 20;

  // Stress modifier (1-10 scale)
  if      (stress <= 3) score += 10;
  else if (stress <= 6) score += 0;
  else if (stress <= 8) score -= 10;
  else                  score -= 20;

  // Age modifier
  const age = parseFloat(user.age) || 25;
  if      (age < 30)  score += 5;
  else if (age <= 40) score += 0;
  else if (age <= 50) score -= 5;
  else                score -= 10;

  // Energy modifier
  if      (energy >= 8) score += 5;
  else if (energy >= 6) score += 0;
  else if (energy >= 4) score -= 5;
  else                  score -= 10;

  // Weight log variance as instability signal
  if ((weightLog || []).length >= 5) {
    const recent = weightLog.slice(-7).map(e => e.weight);
    const mean   = recent.reduce((s, v) => s + v, 0) / recent.length;
    const stdev  = Math.sqrt(recent.reduce((s, v) => s + (v - mean) ** 2, 0) / recent.length);
    if (stdev > 1.5) score -= 5;
  }

  return Math.round(Math.max(0, Math.min(100, score)));
}

export function computeGoalVector(goal) {
  const vecs = {
    bulk:      { fatLoss: 0.10, muscleGain: 0.80, performance: 0.10 },
    cut:       { fatLoss: 0.80, muscleGain: 0.15, performance: 0.05 },
    recomp:    { fatLoss: 0.45, muscleGain: 0.45, performance: 0.10 },
    contest:   { fatLoss: 0.90, muscleGain: 0.05, performance: 0.05 },
    maintain:  { fatLoss: 0.30, muscleGain: 0.30, performance: 0.40 },
    lifestyle: { fatLoss: 0.35, muscleGain: 0.35, performance: 0.30 },
  };
  return vecs[goal] || vecs.bulk;
}

export function computeUserState(user, weightLog, checkIn) {
  const bodyComp      = computeBodyComp(user);
  const bmr           = computeBMR(user);
  const { tdee, pal } = computeTDEE(user, bmr);
  const rcs           = computeRCS(user, weightLog, checkIn);
  const goalVec       = computeGoalVector(user.goal || "bulk");
  return { bodyComp, bmr, tdee, pal, rcs, goalVec };
}

// ── SECTION 3: NUTRITION TARGET ENGINE ───────────────────────────────────────
// True macro cycling: algebraically solve rest-day calories from weekly target

export function computeNutritionTargets(user, userState, isTrainingDay = true, calAdjustment = 0) {
  const { bodyComp, tdee, pal } = userState;
  const goal     = user.goal  || "bulk";
  const level    = user.level || "intermediate";
  const weightKg = bodyComp.weightKg;
  const lbmKg    = bodyComp.lbmKg;
  const { ffmi }  = bodyComp;

  // ── Training sessions/week by level ──────────────────────────────────────
  const SESS_WK = { beginner: 3, intermediate: 4, advanced: 5, competitor: 6 };
  const T = SESS_WK[level] || 4;     // training days/week
  const R = 7 - T;                    // rest days/week

  // ── Weekly calorie delta by goal × level ─────────────────────────────────
  // FFMI ceiling scalar: beginners have more room to bulk aggressively
  const ceilingFFMI = user.sex === "female" ? 21 : 26;
  const headroom    = Math.max(0, ceilingFFMI - ffmi);
  const ffmiScalar  = Math.min(1.0, Math.max(0.10, headroom / 5));

  const WEEKLY_DELTA = {
    bulk:      { beginner: 1750, intermediate: 1575, advanced: 1225, competitor: 1225 },
    cut:       { beginner:-2450, intermediate:-3150, advanced:-2450, competitor:-4200 },
    recomp:    { beginner:  350, intermediate:  175, advanced:     0, competitor:    0 },
    contest:   { beginner:-4200, intermediate:-4200, advanced:-3500, competitor:-4550 },
    maintain:  { beginner:    0, intermediate:    0, advanced:     0, competitor:    0 },
    lifestyle: { beginner:    0, intermediate:    0, advanced:     0, competitor:    0 },
  };
  let weeklyDelta = ((WEEKLY_DELTA[goal] || WEEKLY_DELTA.bulk)[level] || 0) * ffmiScalar;

  // Adaptive thermogenesis: competitor in long deficit gets upward correction
  if (goal === "contest" && level === "competitor") weeklyDelta = weeklyDelta * 0.90;

  weeklyDelta += calAdjustment * 7;

  // ── Train-day calorie bonus (carb bump covers exercise glycogen demand) ───
  const TRAIN_BONUS = { bulk: 150, cut: 100, recomp: 100, contest: 75, maintain: 0, lifestyle: 0 };
  const trainBonus = TRAIN_BONUS[goal] || 0;

  // ── Solve for rest-day calories ───────────────────────────────────────────
  // weekly: T × trainCal + R × restCal = 7 × (TDEE + weeklyDelta/7)
  // trainCal = TDEE + weeklyDelta/7 + trainBonus
  // restCal  = [7×(TDEE + weeklyDelta/7) - T×trainCal] / R
  const weeklyTarget = 7 * tdee + weeklyDelta;
  const trainCal_raw = tdee + weeklyDelta / 7 + trainBonus;
  const restCal_raw  = R > 0 ? (weeklyTarget - T * trainCal_raw) / R : trainCal_raw;

  // ── Hard calorie floors — never more than 750 kcal/day below TDEE ────────
  // lbmKg * 44 was a maintenance multiplier — wrong as a floor. Use TDEE-anchored floor instead.
  const absFloor   = user.sex === "female" ? 1200 : 1500;
  const trainFloor = Math.max(absFloor, Math.round(tdee - 750));
  const restFloor  = Math.max(absFloor - 100, Math.round(tdee - 850));

  let floorsApplied  = false;
  let cyclingActive  = true;

  let trainCal = Math.round(trainCal_raw);
  let restCal  = Math.round(restCal_raw);

  if (restCal < restFloor) {
    // Cycling not viable — disable and use flat target
    restCal      = restFloor;
    trainCal     = Math.round((weeklyTarget - R * restCal) / T);
    cyclingActive = false;
    floorsApplied = true;
  }
  trainCal = Math.max(trainCal, trainFloor);

  // ── Protein ───────────────────────────────────────────────────────────────
  const P_COEFF = { bulk: 2.0, cut: 2.8, recomp: 2.5, contest: 3.0, maintain: 1.9, lifestyle: 1.8 };
  const ageAdj  = (parseFloat(user.age) || 25) > 40 ? 0.3 : 0;
  const protein = Math.round(lbmKg * ((P_COEFF[goal] || 2.0) + ageAdj));

  // ── Fat (hormonal floor: 0.9 g/kg) ──────────────────────────────────────
  const fatBase = Math.max(45, Math.round(weightKg * 0.9));

  // ── Derive carbs by calorie remainder ────────────────────────────────────
  const trainC = Math.max(50, Math.round((trainCal - protein * 4 - fatBase * 9) / 4));
  const restC  = Math.max(50, Math.round((restCal  - protein * 4 - fatBase * 9) / 4));

  // On rest days shift ~10% of calories from carbs to fat (insulin sensitivity)
  const restFatBonus  = Math.round(restC * 0.10 * 4 / 9);    // kcal moved → fat grams
  const restCAdj      = Math.max(50, restC  - Math.round(restC  * 0.10));
  const restFat       = Math.min(Math.round(fatBase * 1.25), fatBase + restFatBonus);
  const trainFat      = fatBase;

  // Recompute actuals after fat shift
  const trainCalActual = Math.round(protein * 4 + trainC  * 4 + trainFat * 9);
  const restCalActual  = Math.round(protein * 4 + restCAdj * 4 + restFat  * 9);
  const weeklyAvg      = Math.round((T * trainCalActual + R * restCalActual) / 7);

  // ── Return day-type slice + full metadata ─────────────────────────────────
  const dayResult = isTrainingDay
    ? { cal: trainCalActual, p: protein, c: trainC,    f: trainFat }
    : { cal: restCalActual,  p: protein, c: restCAdj,  f: restFat  };

  return {
    ...dayResult,
    trainCal:  trainCalActual,
    trainC,
    trainF:    trainFat,
    restCal:   restCalActual,
    restC:     restCAdj,
    restF:     restFat,
    weeklyAvg,
    weeklyDelta: Math.round(weeklyDelta),
    tdee,
    pal,
    sessPerWeek:   T,
    cyclingActive,
    floorsApplied,
    calAdjustment,
    source: "apex_engine_v2",
  };
}

// ── SECTION 5: FEEDBACK LOOP — WEIGHT TREND ANALYSIS ─────────────────────────

export function analyzeWeightTrend(weightLog) {
  if (!weightLog || weightLog.length < 3)
    return { rate: 0, classification: "insufficient_data", confidence: 0, forecast7d: null, currentWeight: null };

  const sorted = [...weightLog].sort((a, b) => a.ts - b.ts);
  // Prefer last 14 days; fall back to last 10 entries
  const cutoff14 = Date.now() - 14 * 86400000;
  const windowed = sorted.filter(e => e.ts >= cutoff14);
  const pts = (windowed.length >= 3 ? windowed : sorted.slice(-10)).map((e, i, arr) => ({
    x: (e.ts - arr[0].ts) / 86400000,
    y: e.weight,
  }));

  const { slope, r2 } = linearRegression(pts);
  const weeklyRate    = slope * 7;  // lbs/week
  const currentWeight = sorted[sorted.length - 1].weight;

  let classification;
  const aw = Math.abs(weeklyRate);
  if      (aw < 0.15)                       classification = "stable";
  else if (weeklyRate > 0 && aw < 0.5)      classification = "gaining_slow";
  else if (weeklyRate > 0 && aw < 1.2)      classification = "gaining_moderate";
  else if (weeklyRate > 0)                   classification = "gaining_fast";
  else if (weeklyRate < 0 && aw < 0.75)     classification = "losing_slow";
  else if (weeklyRate < 0 && aw < 1.5)      classification = "losing_moderate";
  else                                       classification = "losing_fast";

  return {
    rate:          Math.round(weeklyRate * 100) / 100,
    classification,
    confidence:    Math.round(r2 * 100) / 100,
    forecast7d:    Math.round((currentWeight + weeklyRate) * 10) / 10,
    currentWeight,
    slopePerDay:   slope,
    dataPoints:    pts.length,
  };
}

export function getGoalRateInfo(goal) {
  const map = {
    cut:         { label:"Rate of loss", min:-1.0,  max:-0.5,  dir:-1 },
    bulk:        { label:"Rate of gain", min: 0.25, max: 0.75, dir: 1 },
    recomp:      { label:"Recomp rate",  min:-0.25, max: 0.25, dir: 0 },
    maintenance: { label:"Weight rate",  min:-0.25, max: 0.25, dir: 0 },
    contest:     { label:"Rate of loss", min:-1.5,  max:-0.75, dir:-1 },
  };
  return map[goal] || null;
}

export function classifyRate(rate, info) {
  if (info.dir === -1) {
    if (rate >= info.max) return { label:"Too slow", key:"red" };
    if (rate <= info.min) return { label:"Too fast", key:"accent" };
    return { label:"On track", key:"green" };
  }
  if (info.dir === 1) {
    if (rate <= info.min) return { label:"Too slow", key:"muted" };
    if (rate >= info.max) return { label:"Too fast", key:"red" };
    return { label:"On track", key:"green" };
  }
  if (Math.abs(rate) <= 0.25) return { label:"Stable", key:"green" };
  return rate > 0 ? { label:"Gaining", key:"accent" } : { label:"Losing", key:"muted" };
}

// ── WEIGH-IN STREAK ───────────────────────────────────────────────────────────
export function computeWeighInStreak(weightLog) {
  if (!weightLog || !weightLog.length)
    return { current: 0, best: 0, lastDaysAgo: null, loggedToday: false, urgency: "none" };

  const sorted = [...weightLog].sort((a, b) => a.ts - b.ts);
  const toKey  = ts => new Date(ts).toDateString();
  const days   = [...new Set(sorted.map(e => toKey(e.ts)))];

  const todayKey    = new Date().toDateString();
  const loggedToday = days.includes(todayKey);
  const lastDaysAgo = Math.floor((Date.now() - sorted[sorted.length - 1].ts) / 86400000);

  // Walk back from today (or yesterday) counting consecutive days
  let current = 0;
  const cursor = new Date();
  if (!loggedToday) cursor.setDate(cursor.getDate() - 1);
  for (let i = 0; i < 366; i++) {
    if (days.includes(cursor.toDateString())) { current++; cursor.setDate(cursor.getDate() - 1); }
    else break;
  }

  // All-time best streak
  let best = current, run = 1;
  for (let i = 1; i < days.length; i++) {
    const gap = Math.round((new Date(days[i]) - new Date(days[i - 1])) / 86400000);
    run = gap === 1 ? run + 1 : 1;
    if (run > best) best = run;
  }

  const urgency = loggedToday ? "none"
    : lastDaysAgo <= 1 ? "nudge"
    : lastDaysAgo <= 2 ? "warn"
    : "danger";

  return { current, best, lastDaysAgo, loggedToday, urgency };
}

// ── GOAL PACING ENGINE ────────────────────────────────────────────────────────
export function computeGoalPacing(weightLog, user) {
  const goal = user?.goal || "bulk";
  const info = getGoalRateInfo(goal);
  if (!info || !weightLog || weightLog.length < 3)
    return { status: "insufficient_data" };

  const trend = analyzeWeightTrend(weightLog);
  if (trend.dataPoints < 3) return { status: "insufficient_data" };

  const sorted      = [...weightLog].sort((a, b) => a.ts - b.ts);
  const firstWeight = sorted[0].weight;
  const totalChange = Math.round((trend.currentWeight - firstWeight) * 10) / 10;
  const rate        = trend.rate;
  const targetRate  = (info.min + info.max) / 2;   // ideal midpoint
  const rateStatus  = classifyRate(rate, info);

  // Status → label + color key
  let status, statusLabel, colorKey;
  const wrongDir = (info.dir === -1 && rate > 0.1) || (info.dir === 1 && rate < -0.1);
  if (wrongDir) {
    status = "off_course"; statusLabel = "Wrong direction"; colorKey = "red";
  } else if (rateStatus.label === "On track" || rateStatus.label === "Stable") {
    status = "on_track"; statusLabel = "On track"; colorKey = "green";
  } else if (rateStatus.label === "Too fast") {
    status = "ahead";
    statusLabel = info.dir === -1 ? "Cutting fast" : "Gaining fast";
    colorKey = "accent";
  } else {
    const noMovement = Math.abs(rate) < 0.05;
    status = noMovement ? "off_course" : "behind";
    statusLabel = noMovement ? "Not moving" : "Behind pace";
    colorKey = noMovement ? "red" : "red";
  }

  // Milestone targets (cumulative change from first weigh-in)
  const MILESTONES = {
    cut:      [-2.5, -5, -10, -15, -20, -25],
    contest:  [-2.5, -5, -10, -15, -20, -25, -30],
    bulk:     [2.5,  5,  10,  15,  20],
    recomp:   [-5,  -2.5, 0, 2.5, 5],
    maintain: [-2,  -1, 0, 1, 2],
    lifestyle:[-5,  -2.5, 0, 2.5, 5],
  };
  const milestones = MILESTONES[goal] || MILESTONES.bulk;
  const dir        = info.dir;

  let nextMilestone = null, etaWeeks = null;
  if (dir !== 0) {
    const ahead = milestones.filter(m => dir > 0 ? m > totalChange : m < totalChange);
    nextMilestone = ahead.length
      ? ahead.reduce((a, b) => Math.abs(a - totalChange) < Math.abs(b - totalChange) ? a : b)
      : null;
    if (nextMilestone !== null && Math.abs(rate) > 0.05) {
      etaWeeks = Math.ceil(Math.abs(nextMilestone - totalChange) / Math.abs(rate));
    }
  }

  // Momentum 0-100
  const rateDeviation = Math.abs(rate - (dir === 0 ? 0 : targetRate));
  const idealHalf     = Math.abs(info.max - info.min) / 2 || 0.5;
  const rateScore     = Math.max(0, Math.min(50, 50 * (1 - rateDeviation / (idealHalf * 4))));
  const confScore     = trend.confidence * 25;
  const dataScore     = Math.min(25, (trend.dataPoints / 14) * 25);
  const momentum      = Math.round(rateScore + confScore + dataScore);

  // Pace bar 0–100 (capped at target max = 100)
  const paceBarPct = targetRate !== 0 ? Math.min(110, (Math.abs(rate) / Math.abs(targetRate)) * 100) : 0;

  return {
    status, statusLabel, colorKey,
    rate, targetRate, totalChange,
    etaWeeks, nextMilestone, momentum,
    paceBarPct, dir,
    info,
    dataPoints: trend.dataPoints,
    confidence: trend.confidence,
    forecast7d: trend.forecast7d,
  };
}

// ── GOAL CONFIG ENGINE ────────────────────────────────────────────────────────
// Derives a physiologically-grounded goal weight from body composition targets,
// not from user-entered preference. Source of truth for all trajectory logic.

export function bfToVisualOutcome(bf, sex) {
  if (sex === "male") {
    if (bf <= 6)  return "stage conditioning — extreme definition, visible striations";
    if (bf <= 8)  return "contest lean — very visible abs, vascularity";
    if (bf <= 10) return "shredded — sharp ab definition in any lighting";
    if (bf <= 13) return "athletic lean — clear abs in good lighting";
    if (bf <= 17) return "fit — muscular appearance, some ab definition";
    if (bf <= 22) return "average lean — healthy, no visible abs";
    return "recomposition zone — meaningful body composition work ahead";
  } else {
    if (bf <= 12) return "stage conditioning — competition ready";
    if (bf <= 15) return "very lean — bikini/figure athlete";
    if (bf <= 18) return "athletic — visible core definition";
    if (bf <= 23) return "fit and toned";
    if (bf <= 28) return "healthy average";
    return "recomposition zone — meaningful body composition work ahead";
  }
}

export function computeGoalConfig(user) {
  const goal  = user.goal  || "bulk";
  const level = user.level || "intermediate";
  const sex   = user.sex   || "male";

  // Body comp from current profile (uses height-in-inches conversion internally)
  const bodyComp = computeBodyComp(user);
  const { lbmKg, bfPct, ffmi, weightKg } = bodyComp;
  const heightCm = parseFloat(user.height) ? parseFloat(user.height) * 2.54 : 175;
  const heightM  = heightCm / 100;

  const currentWeightLbs = Math.round(weightKg * 2.20462 * 10) / 10;
  const currentLbmLbs    = Math.round(lbmKg    * 2.20462 * 10) / 10;

  // ── TARGET BF% BY GOAL × SEX × LEVEL ─────────────────────────────────────
  const TARGET_BF = {
    cut: {
      male:   { beginner:15, intermediate:12, advanced:10, competitor:8  },
      female: { beginner:22, intermediate:20, advanced:18, competitor:12 },
    },
    contest: {
      male:   { beginner:10, intermediate:8,  advanced:7,  competitor:6  },
      female: { beginner:16, intermediate:14, advanced:12, competitor:10 },
    },
    lifestyle: {
      male:   { beginner:18, intermediate:16, advanced:14, competitor:12 },
      female: { beginner:25, intermediate:23, advanced:21, competitor:18 },
    },
  };

  // ── COMPUTE GOAL WEIGHT ───────────────────────────────────────────────────
  let goalWeightLbs, goalBfPct, goalLbmLbs, goalLbmKg, goalFFMI;
  let isDualTarget = false;

  if (goal === "recomp" || goal === "maintain") {
    // Weight stays roughly flat; composition shifts
    isDualTarget   = true;
    const bfDrop   = goal === "recomp" ? 3.5 : 1;
    const lbmGainKg = goal === "recomp" ? 2 : 0;
    goalBfPct      = Math.max(bfPct - bfDrop, sex === "male" ? 6 : 12);
    goalLbmKg      = lbmKg + lbmGainKg;
    goalLbmLbs     = Math.round(goalLbmKg * 2.20462 * 10) / 10;
    const goalWtKg = goalLbmKg / (1 - goalBfPct / 100);
    goalWeightLbs  = Math.round(goalWtKg * 2.20462 * 10) / 10;
    goalFFMI       = Math.round((goalLbmKg / (heightM * heightM)) * 10) / 10;

  } else if (goal === "bulk") {
    // FFMI headroom model — project 1 year of natural muscle gain
    const CEILING   = sex === "male" ? 25.5 : 21;
    const YR_GAIN   = { beginner:1.5, intermediate:0.8, advanced:0.4, competitor:0.2 };
    const headroom  = Math.max(0, CEILING - ffmi);
    const potential = Math.min(headroom, YR_GAIN[level] || 0.8);
    goalFFMI        = Math.round(Math.min(ffmi + potential, CEILING) * 10) / 10;
    goalLbmKg       = goalFFMI * (heightM * heightM);
    goalLbmLbs      = Math.round(goalLbmKg * 2.20462 * 10) / 10;
    const bfIncrease = { beginner:3, intermediate:2, advanced:2, competitor:1.5 }[level] || 2;
    goalBfPct       = Math.min(bfPct + bfIncrease, sex === "male" ? 20 : 28);
    const goalWtKg  = goalLbmKg / (1 - goalBfPct / 100);
    goalWeightLbs   = Math.round(goalWtKg * 2.20462 * 10) / 10;

  } else {
    // cut / contest / lifestyle — preserve LBM, reduce fat to target %
    const bfTable  = TARGET_BF[goal]?.[sex] || TARGET_BF.cut[sex];
    goalBfPct      = bfTable[level] ?? (sex === "male" ? 12 : 20);
    // Never target below essential fat
    goalBfPct      = Math.max(goalBfPct, sex === "male" ? 5 : 12);
    goalLbmKg      = lbmKg;  // LBM preserved on cut
    goalLbmLbs     = currentLbmLbs;
    const goalWtKg = goalLbmKg / (1 - goalBfPct / 100);
    goalWeightLbs  = Math.round(goalWtKg * 2.20462 * 10) / 10;
    goalFFMI       = Math.round((goalLbmKg / (heightM * heightM)) * 10) / 10;
  }

  goalBfPct = Math.round(goalBfPct * 10) / 10;

  // Acceptable ±range (used for override validation and UI band)
  const rangeBuffer  = isDualTarget ? 3 : 4;
  const goalWeightRange = [
    Math.round((goalWeightLbs - rangeBuffer) * 10) / 10,
    Math.round((goalWeightLbs + rangeBuffer) * 10) / 10,
  ];

  // ── IDEAL WEEKLY RATE ─────────────────────────────────────────────────────
  const IDEAL_RATE = {
    cut:       { beginner:0.75, intermediate:0.75, advanced:0.75, competitor:1.0  },
    contest:   { beginner:1.0,  intermediate:1.25, advanced:1.0,  competitor:1.5  },
    bulk:      { beginner:0.5,  intermediate:0.4,  advanced:0.3,  competitor:0.25 },
    recomp:    { beginner:0.3,  intermediate:0.2,  advanced:0.15, competitor:0.1  },
    maintain:  { beginner:0,    intermediate:0,    advanced:0,    competitor:0    },
    lifestyle: { beginner:0.5,  intermediate:0.5,  advanced:0.5,  competitor:0.5  },
  };
  const idealRate   = (IDEAL_RATE[goal] || IDEAL_RATE.bulk)[level] || 0.5;
  const totalDelta  = Math.abs(goalWeightLbs - currentWeightLbs);
  const etaWeeks    = idealRate > 0 ? Math.ceil(totalDelta / idealRate) : (isDualTarget ? 16 : 0);
  const etaDate     = new Date(Date.now() + etaWeeks * 7 * 86400000)
    .toLocaleDateString("en-US", { month:"long", year:"numeric" });

  // ── SUSTAINABILITY SCORE (0-100) ──────────────────────────────────────────
  let sustainScore = 100;
  if      (totalDelta > 30) sustainScore -= 25;
  else if (totalDelta > 20) sustainScore -= 12;
  else if (totalDelta > 15) sustainScore -= 5;
  if      (etaWeeks < 6)   sustainScore -= 20;
  else if (etaWeeks < 8)   sustainScore -= 8;
  if (etaWeeks >= 12 && etaWeeks <= 20) sustainScore += 5;
  if (goalBfPct < (sex === "male" ? 7 : 14)) sustainScore -= 15;
  if (goal === "bulk" && goalFFMI > 24 && sex === "male") sustainScore -= 10;
  sustainScore = Math.max(0, Math.min(100, Math.round(sustainScore)));

  // ── REALISTIC RATING ──────────────────────────────────────────────────────
  let realisticRating;
  if      (goal === "recomp" || goal === "maintain") realisticRating = "moderate";
  else if (totalDelta <= 10 && etaWeeks >= 10)       realisticRating = "conservative";
  else if (totalDelta <= 20 && etaWeeks >= 8)        realisticRating = "moderate";
  else if (totalDelta <= 30 && etaWeeks >= 6)        realisticRating = "aggressive";
  else                                               realisticRating = "unrealistic";

  // ── VISUAL OUTCOMES ───────────────────────────────────────────────────────
  const currentVisual = bfToVisualOutcome(bfPct,    sex);
  const goalVisual    = bfToVisualOutcome(goalBfPct, sex);

  // ── RATIONALE (shown to user) ─────────────────────────────────────────────
  let rationale;
  if (goal === "cut" || goal === "contest") {
    rationale = `At ${currentWeightLbs} lbs and ~${bfPct.toFixed(1)}% body fat (${currentVisual}), your lean mass of ${currentLbmLbs} lbs supports a goal of ${goalWeightLbs} lbs at ${goalBfPct}% BF — ${goalVisual}. This preserves your muscle while achieving your visual outcome in ~${etaWeeks} weeks.`;
  } else if (goal === "bulk") {
    rationale = `Your FFMI of ${ffmi.toFixed(1)} gives meaningful room to grow. A ${etaWeeks}-week lean bulk targeting FFMI ${goalFFMI} puts you at ${goalWeightLbs} lbs at ~${goalBfPct}% BF — adding muscle while keeping fat gain controlled.`;
  } else if (goal === "recomp") {
    rationale = `Recomposition keeps your scale weight near ${currentWeightLbs} lbs while body fat drops from ${bfPct.toFixed(1)}% to ~${goalBfPct}% and lean mass increases ~${Math.round((goalLbmLbs - currentLbmLbs) * 10) / 10} lbs. Slower than a dedicated phase, but produces the most balanced outcome.`;
  } else if (goal === "maintain") {
    rationale = `Hold ${currentWeightLbs} lbs while gradually improving composition. Precision nutrition keeps BF near ${goalBfPct.toFixed(1)}% long-term.`;
  } else {
    rationale = `A ${goal} phase targeting ${goalWeightLbs} lbs at ${goalBfPct.toFixed(1)}% BF over ~${etaWeeks} weeks. Balanced pace for adherence.`;
  }

  return {
    id:                   String(Date.now()),
    createdAt:            Date.now(),
    updatedAt:            Date.now(),
    goalType:             goal,

    // System-derived targets
    goalWeight:           goalWeightLbs,
    goalWeightRange,
    goalBfPct,
    goalLbmLbs,
    goalFFMI,
    isDualTarget,

    // Evaluation
    sustainabilityScore:  sustainScore,
    realisticRating,
    etaWeeks,
    etaDate,
    idealWeeklyRate:      idealRate,
    projectedVisualOutcome: goalVisual,
    currentVisualOutcome:   currentVisual,
    rationale,

    // Baselines for delta tracking
    startWeight:          currentWeightLbs,
    startBfPct:           Math.round(bfPct * 10) / 10,
    startLbmLbs:          currentLbmLbs,
    startFFMI:            ffmi,

    // User override
    userOverrideWeight:   null,
    overrideAccepted:     false,
    overrideTs:           null,
    effectiveGoalWeight:  goalWeightLbs,

    // Revision tracking (populated by Phase 3 accept/defer/dismiss)
    acknowledgedTriggers: [],
    snoozedUntil:         null,
    revisionHistory:      [],
  };
}

// ── PHASE 2: SNAPSHOT ENGINE ─────────────────────────────────────────────────

// Returns true when enough new data has accumulated to justify a new snapshot
export function shouldTakeSnapshot(weightLog, allSnapshots) {
  if (!weightLog || weightLog.length < 3) return false;
  if (!allSnapshots.length) return true;                         // first snapshot ever

  const last       = allSnapshots[allSnapshots.length - 1];
  const daysSince  = Math.floor((Date.now() - last.ts) / 86400000);
  if (daysSince >= 7) return true;                               // weekly cadence

  const newLogs = weightLog.filter(e => e.ts > last.ts);
  return newLogs.length >= 4;                                    // 4+ new data points
}

// Captures a full physiological + progress state at a point in time
export function computeProgressSnapshot(user, sortedLog, goalConfig, nutLogs, trainingHistory) {
  const bodyComp        = computeBodyComp(user);
  const { lbmLbs, bfPct, ffmi, weightKg } = bodyComp;  // lbmLbs available via bodyComp
  const currentWeightLbs = Math.round(weightKg * 2.20462 * 10) / 10;
  const lbmLbsVal        = Math.round(bodyComp.lbmLbs * 10) / 10;

  const trend    = analyzeWeightTrend(sortedLog);
  const info     = getGoalRateInfo(user.goal || "bulk");

  // Plateau: meaningful goal, enough data, near-zero movement
  const goalDir  = info?.dir ?? 0;
  const moving   = Math.abs(trend.rate) > 0.15;
  const plateauDetected = !!(
    info && trend.dataPoints >= 10 && !moving && goalDir !== 0
  );

  // Rate alert
  let rateAlert = null;
  if (info && trend.dataPoints >= 5) {
    const st = classifyRate(trend.rate, info);
    if      (st.label === "Too fast")                        rateAlert = "too_fast";
    else if (st.label === "Too slow")                        rateAlert = "too_slow";
    else if (goalDir ===  1 && trend.rate < -0.1)           rateAlert = "off_course";
    else if (goalDir === -1 && trend.rate >  0.1)           rateAlert = "off_course";
  }

  // Progress toward goal
  const effective    = goalConfig?.effectiveGoalWeight ?? null;
  const weightToGoal = effective !== null
    ? Math.round((currentWeightLbs - effective) * 10) / 10 : null;
  const bfToGoal     = goalConfig?.goalBfPct !== undefined
    ? Math.round((bfPct - goalConfig.goalBfPct) * 10) / 10 : null;
  const deltaFromStart = goalConfig?.startWeight !== undefined
    ? Math.round((currentWeightLbs - goalConfig.startWeight) * 10) / 10 : null;

  // Recalculated ETA from current rate
  const etaWeeks = (effective !== null && Math.abs(trend.rate) > 0.05)
    ? Math.ceil(Math.abs(weightToGoal) / Math.abs(trend.rate))
    : goalConfig?.etaWeeks ?? null;

  // Adherence (training + nutrition)
  const sessWk         = { beginner:3, intermediate:4, advanced:5, competitor:6 }[user.level||"intermediate"] || 4;
  const adherenceScore = computeAdherenceScore(nutLogs, trainingHistory, sessWk);

  return {
    ts:               Date.now(),
    weight:           currentWeightLbs,
    estimatedBfPct:   Math.round(bfPct  * 10) / 10,
    estimatedLbmLbs:  lbmLbsVal,
    ffmi:             Math.round(ffmi   * 10) / 10,
    weeklyRate:       trend.rate,
    rateConfidence:   trend.confidence,
    dataPoints:       trend.dataPoints,
    weightToGoal,
    bfToGoal,
    deltaFromStart,
    etaWeeks,
    adherenceScore,
    plateauDetected,
    rateAlert,
    goalRevisionSuggested: false,   // set by evaluateGoalRevision
    revisionReason:        null,
    revisionTrigger:       null,
  };
}

// Analyses a new snapshot against history and goalConfig;
// returns a structured revision suggestion or null
export function evaluateGoalRevision(snap, goalConfig, allSnapshots) {
  if (!snap || !goalConfig) return null;

  // Respect snooze window (set by "Defer 7d")
  if (goalConfig.snoozedUntil && Date.now() < goalConfig.snoozedUntil) return null;

  const acked  = new Set(goalConfig.acknowledgedTriggers || []);
  const goal   = goalConfig.goalType;
  const recent = allSnapshots.slice(-4);   // ~4 weeks lookback

  // ── Trigger 1: LBM erosion on cut ─────────────────────────────────────────
  if (!acked.has("lbm_loss") && (goal === "cut" || goal === "contest") && goalConfig.startLbmLbs) {
    const lbmLoss = goalConfig.startLbmLbs - snap.estimatedLbmLbs;
    if (lbmLoss > 4) {
      const revised = Math.round(snap.estimatedLbmLbs / (1 - goalConfig.goalBfPct / 100) * 10) / 10;
      return {
        suggested: true, trigger: "lbm_loss", confidence: "high",
        revisedGoalWeight: revised,
        reason: `You've lost ~${lbmLoss.toFixed(1)} lbs of lean mass since starting. A revised goal of ${revised} lbs still hits ${goalConfig.goalBfPct}% BF while protecting what you've built.`,
      };
    }
  }

  // ── Trigger 2: Persistent plateau ─────────────────────────────────────────
  if (!acked.has("plateau")) {
    const plateauStreak = recent.filter(s => s.plateauDetected).length;
    if (snap.plateauDetected && plateauStreak >= 2) {
      const lever = (goal === "cut" || goal === "contest") ? "calorie deficit" : "surplus";
      return {
        suggested: true, trigger: "plateau", confidence: "medium",
        revisedGoalWeight: null,
        reason: `Trend stalled (< 0.15 lbs/wk) for ${plateauStreak + 1} consecutive snapshots. Your ${lever} may need recalibration, or this weight is a natural set-point worth reassessing.`,
      };
    }
  }

  // ── Trigger 3: Timeline slippage ≥ 1.6× original ──────────────────────────
  if (!acked.has("timeline_extended") && snap.etaWeeks && goalConfig.etaWeeks && snap.rateConfidence >= 0.5) {
    if (snap.etaWeeks > goalConfig.etaWeeks * 1.6) {
      return {
        suggested: true, trigger: "timeline_extended", confidence: "medium",
        revisedGoalWeight: null,
        reason: `Original ETA was ${goalConfig.etaWeeks} weeks; at your current pace it's now ${snap.etaWeeks}. Tighten your protocol or reset the timeline.`,
      };
    }
  }

  // ── Trigger 4: Running leaner than projected (cut ahead of pace) ───────────
  if (!acked.has("ahead_of_pace") && (goal === "cut" || goal === "contest") && goalConfig.startBfPct && goalConfig.etaWeeks > 0) {
    const weeksElapsed = Math.max(1, Math.round((Date.now() - goalConfig.createdAt) / (7 * 86400000)));
    const expectedDrop = (goalConfig.startBfPct - goalConfig.goalBfPct) * (weeksElapsed / goalConfig.etaWeeks);
    const actualDrop   = goalConfig.startBfPct - snap.estimatedBfPct;
    if (actualDrop > expectedDrop * 1.4 && actualDrop > 3 && weeksElapsed >= 4) {
      const projected = Math.round(snap.estimatedLbmLbs / (1 - goalConfig.goalBfPct / 100) * 10) / 10;
      return {
        suggested: true, trigger: "ahead_of_pace", confidence: "medium",
        revisedGoalWeight: projected,
        reason: `You're leaning out ahead of schedule. At this rate you'll hit ${goalConfig.goalBfPct}% BF at ~${projected} lbs — ${(goalConfig.effectiveGoalWeight - projected).toFixed(1)} lbs above your original target. Stopping here protects performance and hormones.`,
      };
    }
  }

  // ── Trigger 5: Fat-dominant bulk (FFMI ceiling approaching) ───────────────
  if (!acked.has("ffmi_ceiling") && goal === "bulk" && snap.ffmi >= 22.5 && recent.length >= 2) {
    const first      = recent[0];
    const wtGain     = snap.weight - first.weight;
    const lbmGain    = snap.estimatedLbmLbs - first.estimatedLbmLbs;
    const efficiency = wtGain > 0.5 ? lbmGain / wtGain : 1;
    if (efficiency < 0.35 && wtGain > 2) {
      return {
        suggested: true, trigger: "ffmi_ceiling", confidence: "medium",
        revisedGoalWeight: null,
        reason: `At FFMI ${snap.ffmi.toFixed(1)}, recent gains are ~${Math.round(efficiency * 100)}% lean mass. Fat-dominant gains near your ceiling suggest a cut phase would sharpen your physique before your next bulk.`,
      };
    }
  }

  return null;
}

// ── GOAL-NUTRITION BRIDGE ────────────────────────────────────────────────────
// Derives a daily calorie adjustment needed to hit goalConfig.idealWeeklyRate.
// More precise than the classification-based runProtocolDecision because it
// anchors directly to the user's specific goal rate, not generic thresholds.
//
// Formula: deviation (lbs/wk) × 3500 kcal/lb ÷ 7 days = kcal/day to adjust
// Positive result → add calories (rate too slow toward bulk / recovering from fast cut)
// Negative result → remove calories (rate too slow on cut / over-eating on bulk)

export function computeNutritionAdjustment(goalConfig, weightTrend) {
  if (!goalConfig || !weightTrend) return 0;
  if (!goalConfig.idealWeeklyRate || goalConfig.idealWeeklyRate === 0) return 0;
  if (goalConfig.isDualTarget) return 0;               // recomp — weight not the signal
  if (weightTrend.dataPoints < 7)                      return 0;  // need enough data
  if (weightTrend.confidence < 0.5)                    return 0;  // low-quality trend

  const ideal    = goalConfig.idealWeeklyRate;          // e.g. -0.75 lbs/wk for cut
  const actual   = weightTrend.rate;                    // e.g. -0.30 lbs/wk
  const deviation = ideal - actual;                     // -0.45 → need bigger deficit

  // Only adjust when deviation is meaningful (> 20% of the target rate)
  if (Math.abs(deviation) < Math.abs(ideal) * 0.20) return 0;

  const rawAdj = Math.round((deviation * 3500) / 7);
  const MAX    = 300;  // never suggest more than 300 kcal/day change at once
  return Math.max(-MAX, Math.min(MAX, rawAdj));
}

// ── SECTION 5: E1RM & STRENGTH TREND ─────────────────────────────────────────

export function computeE1RM(weight, reps) {
  const w = parseFloat(weight), r = parseFloat(reps);
  if (!w || !r) return 0;
  return Math.round(w * (1 + r / 30));   // Epley formula
}

export function analyzeStrengthTrend(trainingHistory) {
  if (!trainingHistory || trainingHistory.length < 2) return {};
  const exData = {};
  trainingHistory.forEach((sess, si) => {
    (sess.completedExercises || []).forEach(ex => {
      if (!exData[ex.name]) exData[ex.name] = [];
      const best = (ex.loggedSets || [])
        .filter(s => s.reps && s.weight)
        .reduce((b, s) => Math.max(b, computeE1RM(s.weight, s.reps)), 0);
      if (best > 0) exData[ex.name].push({ x: si, y: best, ts: sess.ts });
    });
  });
  const trends = {};
  Object.entries(exData).forEach(([name, pts]) => {
    if (pts.length < 2) return;
    const { slope, r2 } = linearRegression(pts);
    trends[name] = {
      slope:    Math.round(slope * 10) / 10,
      r2:       Math.round(r2    * 100) / 100,
      latest:   pts[pts.length - 1].y,
      sessions: pts.length,
      trend:    slope > 0.5 ? "improving" : slope < -0.5 ? "declining" : "maintaining",
    };
  });
  return trends;
}

// ── SECTION 5: ADHERENCE SCORING ─────────────────────────────────────────────

export function computeAdherenceScore(nutLogs, trainingHistory, targetSessionsPerWeek = 4) {
  const cutoff = Date.now() - 7 * 86400000;
  const recentSessions = (trainingHistory || []).filter(s => s.ts >= cutoff).length;
  const trainingAdherence = Math.min(recentSessions / Math.max(targetSessionsPerWeek * 0.6, 2), 1.0);
  const nutDays = new Set(
    (nutLogs || []).filter(l => l.ts >= cutoff).map(l => new Date(l.ts).toDateString())
  ).size;
  const nutAdherence = Math.min(nutDays / 7, 1.0);
  return Math.round((nutAdherence * 0.55 + trainingAdherence * 0.45) * 100);
}

// ── SECTION 6: CONFIDENCE SCORING ────────────────────────────────────────────

export function computeConfidenceScore(weightLog, trainingHistory, nutLogs) {
  const c7  = Date.now() - 7  * 86400000;
  const c14 = Date.now() - 14 * 86400000;
  const wt7   = Math.min((weightLog     || []).filter(e => e.ts >= c7).length  / 7, 1) * 0.30;
  const sess  = Math.min((trainingHistory||[]).filter(s => s.ts >= c14).length / 5, 1) * 0.25;
  const nut   = Math.min(new Set((nutLogs||[]).filter(l=>l.ts>=c7).map(l=>new Date(l.ts).toDateString())).size / 7, 1) * 0.25;
  const rich  = Math.min((weightLog||[]).length / 14, 1) * 0.20;
  return Math.round((wt7 + sess + nut + rich) * 100) / 100;
}

// ── SECTION 6: FATIGUE DEBT MODEL ────────────────────────────────────────────

export function computeFatigueDebt(trainingHistory, baselineSessions = 4) {
  if (!trainingHistory || !trainingHistory.length) return 0;
  let debt = 0;
  const now = Date.now();
  for (let week = 0; week < 3; week++) {
    const end   = now - week * 7 * 86400000;
    const start = end - 7 * 86400000;
    const sessions = trainingHistory.filter(s => s.ts >= start && s.ts < end);
    debt += Math.max(0, sessions.length - baselineSessions) * 3;
    sessions.forEach(sess => {
      const sets  = (sess.completedExercises || []).flatMap(ex => ex.loggedSets || []);
      const sfrSets = sets.filter(s => s.rpe);
      const avgSfr  = sfrSets.length ? sfrSets.reduce((s, x) => s + parseFloat(x.rpe), 0) / sfrSets.length : 3;
      // Low SFR = high fatigue cost; invert for debt calculation
      if (avgSfr <= 2) debt += 7;
      else if (avgSfr <= 3) debt += 4;
    });
  }
  return Math.round(Math.max(0, debt - 15));
}

// ── SECTION 6 + 7: DECISION ENGINE ───────────────────────────────────────────

export function runProtocolDecision({ user, userState, weightTrend, confidenceScore, fatigueDebt, adaptationSignal, nutLogs, trainingHistory }) {
  const goal = user.goal || "bulk";
  const { rcs } = userState;
  const adherence = computeAdherenceScore(nutLogs, trainingHistory);
  const decisions = [];
  let calAdjustment = 0;

  // ── GATE: low adherence invalidates all trend signals ──
  if (adherence < 70) {
    return {
      calAdjustment: 0, volumeSignal: "maintain", deloadRecommended: false,
      adherence, fatigueDebt,
      decisions: [{ type: "adherence", priority: "P0",
        msg: `Adherence at ${adherence}% — fix compliance before adjusting protocol. Log consistently for 7 days to unlock intelligent recommendations.`,
        color: "red" }],
    };
  }
  // ── GATE: insufficient data ──
  if (confidenceScore < 0.45) {
    return {
      calAdjustment: 0, volumeSignal: "maintain", deloadRecommended: false,
      adherence, fatigueDebt,
      decisions: [{ type: "data", priority: "info",
        msg: `Confidence ${Math.round(confidenceScore * 100)}% — log weight daily and complete sessions to unlock protocol adjustments.`,
        color: "muted" }],
    };
  }

  // ── DELOAD CHECK ──
  let deloadRecommended = false, deloadReason = "";
  if      (fatigueDebt > 60)                  { deloadRecommended = true; deloadReason = `Fatigue debt critical (${fatigueDebt}) — immediate deload required.`; }
  else if (fatigueDebt > 40)                  { deloadRecommended = true; deloadReason = `Fatigue accumulating (${fatigueDebt}) — schedule deload this week.`; }
  else if (rcs < 40)                          { deloadRecommended = true; deloadReason = `Recovery score critical (${rcs}/100) — rest week needed.`; }
  else if (adaptationSignal === "fatigue")    { deloadRecommended = true; deloadReason = "Performance degrading across multiple sessions — deload recommended."; }
  if (deloadRecommended) decisions.push({ type: "deload", priority: "P0", msg: deloadReason, color: "red" });

  // ── CALORIE ADJUSTMENT ENGINE ──
  const conf = confidenceScore;
  const adjMag = conf >= 0.80 ? 1.0 : conf >= 0.60 ? 0.6 : 0.35;
  const rate = weightTrend.rate;
  const hasSignal = weightTrend.confidence >= 0.40 && weightTrend.dataPoints >= 5;

  if (goal === "cut" || goal === "contest") {
    if (hasSignal) {
      if (rate < -1.5) {
        calAdjustment = Math.round(175 * adjMag);
        decisions.push({ type: "calories", priority: "P1", msg: `Losing ${Math.abs(rate).toFixed(1)} lbs/wk — too aggressive. +${calAdjustment} kcal to protect LBM.`, color: "green" });
      } else if (rate > -0.15) {
        calAdjustment = Math.round(-150 * adjMag);
        decisions.push({ type: "calories", priority: "P1", msg: `Weight stalled on deficit. Reducing ${Math.abs(calAdjustment)} kcal to restart fat loss.`, color: "red" });
      } else {
        decisions.push({ type: "calories", priority: "info", msg: `Fat loss rate optimal: ${Math.abs(rate).toFixed(1)} lbs/wk. Hold current calories.`, color: "green" });
      }
    }
  } else if (goal === "bulk") {
    if (hasSignal) {
      if (rate > 0.6) {
        calAdjustment = Math.round(-100 * adjMag);
        decisions.push({ type: "calories", priority: "P1", msg: `Gaining ${rate.toFixed(1)} lbs/wk — surplus too aggressive. Trimming ${Math.abs(calAdjustment)} kcal.`, color: "accent" });
      } else if (rate < 0.08) {
        calAdjustment = Math.round(150 * adjMag);
        decisions.push({ type: "calories", priority: "P2", msg: `Lean bulk rate below target. Adding ${calAdjustment} kcal to support muscle growth.`, color: "green" });
      } else {
        decisions.push({ type: "calories", priority: "info", msg: `Lean bulk on track: +${rate.toFixed(1)} lbs/wk. Optimal range.`, color: "green" });
      }
    }
  } else if (goal === "recomp") {
    if (Math.abs(rate) > 0.5 && hasSignal) {
      decisions.push({ type: "calories", priority: "P2", msg: `Weight shifting ${rate > 0 ? "up" : "down"} ${Math.abs(rate).toFixed(1)} lbs/wk on recomp — verify composition via strength trends.`, color: "accent" });
    } else {
      decisions.push({ type: "calories", priority: "info", msg: "Weight stable on recomp — check strength trends to confirm muscle gain.", color: "muted" });
    }
  }

  // ── VOLUME SIGNAL ──
  let volumeSignal = "maintain";
  if (!deloadRecommended) {
    if      (adaptationSignal === "progress" && rcs >= 65) volumeSignal = "increase";
    else if (adaptationSignal === "fatigue"  || rcs < 55)  volumeSignal = "decrease";
    else if (adaptationSignal === "stall") {
      decisions.push({ type: "volume", priority: "P2", msg: "Volume stalled — increase load by 2.5–5 lbs on compound lifts rather than adding sets.", color: "accent" });
    }
  }

  // ── PLATEAU DETECTION ──
  if (weightTrend.classification === "stable" && weightTrend.confidence >= 0.60
      && (goal === "cut" || goal === "contest") && (trainingHistory || []).length >= 6) {
    decisions.push({ type: "plateau", priority: "P1", msg: "Plateau detected. Recalculate TDEE at current bodyweight and audit total weekly calories including unlogged items.", color: "accent" });
  }

  // ── RECOVERY GUIDANCE ──
  if (rcs < 55 && rcs >= 40 && !deloadRecommended) {
    decisions.push({ type: "recovery", priority: "P2", msg: `Recovery score ${rcs}/100 — reduce session intensity or add a rest day.`, color: "accent" });
  }

  return { calAdjustment, volumeSignal, deloadRecommended, adherence, fatigueDebt, decisions };
}

// ─── END APEX ALGORITHM ENGINE ────────────────────────────────────────────────
