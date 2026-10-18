// Adaptive training engine: exercise database, splits, volume landmarks, program generation and adaptation.
// Moved out of App.jsx in Phase 0.


// ── ENHANCED EXERCISE DATABASE — full tagging: primary, secondary[], movement, stim ──
export const EX_DB = {
  // ── CHEST ─────────────────────────────────────────────────────────────────────
  // A-day compound: Incline Barbell Press (matches your push day primary)
  // B-day compound: Machine Incline Press → Machine Chest Press rotation
  "Incline Barbell Press":    {primary:"chest",    secondary:["triceps","front_delt"],  movement:"incline_push",    stim:9},
  "Machine Incline Press":    {primary:"chest",    secondary:["triceps","front_delt"],  movement:"incline_push",    stim:8},
  "Machine Chest Press":      {primary:"chest",    secondary:["triceps","front_delt"],  movement:"horizontal_push", stim:8},
  "Incline DB Press":         {primary:"chest",    secondary:["triceps","front_delt"],  movement:"incline_push",    stim:8},
  "DB Bench Press":           {primary:"chest",    secondary:["triceps","front_delt"],  movement:"horizontal_push", stim:7},
  "Dips":                     {primary:"chest",    secondary:["triceps"],               movement:"vertical_push",   stim:8},
  "Pec Deck":                 {primary:"chest",    secondary:[],                        movement:"fly",             stim:8},
  "Cable Fly":                {primary:"chest",    secondary:[],                        movement:"fly",             stim:8},
  "Low-to-High Cable Fly":    {primary:"chest",    secondary:[],                        movement:"fly",             stim:7},
  "Incline DB Fly":           {primary:"chest",    secondary:["front_delt"],            movement:"incline_fly",     stim:7},

  // ── BACK ──────────────────────────────────────────────────────────────────────
  // A-day compound: Deadlift / Barbell Row  |  B-day: T-Bar Row / Machine Row
  "Deadlift":                 {primary:"back",     secondary:["hams","glutes","traps"],  movement:"hinge",           stim:10},
  "Barbell Row":              {primary:"back",     secondary:["biceps","rear_delt"],     movement:"horizontal_pull", stim:9},
  "T-Bar Row":                {primary:"back",     secondary:["biceps","rear_delt"],     movement:"horizontal_pull", stim:9},
  "Machine Row":              {primary:"back",     secondary:["biceps","rear_delt"],     movement:"horizontal_pull", stim:8},
  "Seated Cable Row":         {primary:"back",     secondary:["biceps","rear_delt"],     movement:"horizontal_pull", stim:8},
  "Lying Machine Row":        {primary:"back",     secondary:["biceps","rear_delt"],     movement:"horizontal_pull", stim:8},
  "Single-Arm DB Row":        {primary:"back",     secondary:["biceps"],                 movement:"horizontal_pull", stim:8},
  "Machine Lat Pulldown":     {primary:"back",     secondary:["biceps"],                 movement:"vertical_pull",   stim:8},
  "Cable Lat Pulldown":       {primary:"back",     secondary:["biceps"],                 movement:"vertical_pull",   stim:8},
  "Straight-Arm Pulldown":    {primary:"back",     secondary:[],                         movement:"vertical_pull",   stim:7},
  "Face Pull":                {primary:"rear_delt",secondary:["back","traps"],           movement:"horizontal_pull", stim:8},
  "Rear Delt Machine":        {primary:"rear_delt",secondary:["back"],                   movement:"fly",             stim:7},

  // ── SHOULDERS ─────────────────────────────────────────────────────────────────
  // A-day compound: DB Shoulder Press (your push day movement, 60 lbs)
  // Lateral Raise: your push day isolation (20 lbs DB)
  "DB Shoulder Press":        {primary:"delts",    secondary:["triceps"],                movement:"vertical_push",   stim:9},
  "Overhead Press":           {primary:"delts",    secondary:["triceps","traps"],         movement:"vertical_push",   stim:9},
  "Machine Shoulder Press":   {primary:"delts",    secondary:["triceps"],                movement:"vertical_push",   stim:8},
  "DB Arnold Press":          {primary:"delts",    secondary:["triceps"],                movement:"vertical_push",   stim:8},
  "Lateral Raise":            {primary:"delts",    secondary:[],                         movement:"isolation",       stim:8},
  "Cable Lateral Raise":      {primary:"delts",    secondary:[],                         movement:"isolation",       stim:8},
  "Upright Row":              {primary:"delts",    secondary:["traps","biceps"],          movement:"vertical_pull",   stim:7},

  // ── TRICEPS ───────────────────────────────────────────────────────────────────
  // A-day isolation: Cable Rope Pushdown (your push day finisher)
  // B-day isolation: Skull Crusher
  "Close-Grip Bench":         {primary:"triceps",  secondary:["chest","front_delt"],     movement:"horizontal_push", stim:8},
  "Cable Rope Pushdown":      {primary:"triceps",  secondary:[],                         movement:"isolation",       stim:9},
  "Skull Crusher":            {primary:"triceps",  secondary:[],                         movement:"isolation",       stim:8},
  "Overhead Cable Extension": {primary:"triceps",  secondary:[],                         movement:"isolation",       stim:8},
  "Tricep Machine":           {primary:"triceps",  secondary:[],                         movement:"isolation",       stim:7},
  "DB Overhead Extension":    {primary:"triceps",  secondary:[],                         movement:"isolation",       stim:7},

  // ── BICEPS ────────────────────────────────────────────────────────────────────
  // A-day: Incline DB Curl (peak stretch) | B-day: Barbell Curl
  "Incline DB Curl":          {primary:"biceps",   secondary:[],                         movement:"isolation",       stim:9},
  "Barbell Curl":             {primary:"biceps",   secondary:["forearms"],               movement:"isolation",       stim:8},
  "Preacher Curl":            {primary:"biceps",   secondary:[],                         movement:"isolation",       stim:8},
  "Cable Curl":               {primary:"biceps",   secondary:[],                         movement:"isolation",       stim:8},
  "Dumbbell Curl":            {primary:"biceps",   secondary:["forearms"],               movement:"isolation",       stim:7},
  "Hammer Curl":              {primary:"biceps",   secondary:["forearms"],               movement:"isolation",       stim:7},

  // ── QUADS ─────────────────────────────────────────────────────────────────────
  // A-day compound: Back Squat | B-day: Pendulum Squat / Hack Squat
  "Back Squat":               {primary:"quads",    secondary:["glutes","hams"],          movement:"squat",           stim:10},
  "Pendulum Squat":           {primary:"quads",    secondary:["glutes"],                 movement:"squat",           stim:9},
  "Hack Squat":               {primary:"quads",    secondary:["glutes","hams"],          movement:"squat",           stim:9},
  "Leg Press":                {primary:"quads",    secondary:["glutes","hams"],          movement:"squat",           stim:8},
  "Bulgarian Split Squat":    {primary:"quads",    secondary:["glutes"],                 movement:"lunge",           stim:9},
  "Leg Extension":            {primary:"quads",    secondary:[],                         movement:"isolation",       stim:7},

  // ── HAMSTRINGS ────────────────────────────────────────────────────────────────
  "Romanian Deadlift":        {primary:"hams",     secondary:["glutes","lower_back"],    movement:"hinge",           stim:9},
  "Stiff-Leg Deadlift":       {primary:"hams",     secondary:["glutes","lower_back"],    movement:"hinge",           stim:8},
  "Leg Curl":                 {primary:"hams",     secondary:[],                         movement:"isolation",       stim:8},
  "Hip Thrust":               {primary:"glutes",   secondary:["hams"],                   movement:"hip_extension",   stim:9},

  // ── CALVES ────────────────────────────────────────────────────────────────────
  "Standing Calf Raise":      {primary:"calves",   secondary:[],                         movement:"isolation",       stim:8},
  "Seated Calf Raise":        {primary:"calves",   secondary:[],                         movement:"isolation",       stim:8},
  "Leg Press Calf Raise":     {primary:"calves",   secondary:[],                         movement:"isolation",       stim:7},

  // ── ABS ───────────────────────────────────────────────────────────────────────
  "Cable Crunch":             {primary:"abs",      secondary:[],                         movement:"isolation",       stim:8},
  "Hanging Leg Raise":        {primary:"abs",      secondary:[],                         movement:"isolation",       stim:8},
  "Ab Wheel":                 {primary:"abs",      secondary:["lower_back"],             movement:"isolation",       stim:8},
  "Decline Crunch":           {primary:"abs",      secondary:[],                         movement:"isolation",       stim:6},
  "Plank":                    {primary:"abs",      secondary:["lower_back"],             movement:"isometric",       stim:5},
};

// ── EXERCISE RESOLVER — fuzzy muscle classification ───────────────────────────
// Priority: EX_DB exact → case-insensitive → partial (input contains DB name)
// → keyword pattern → null (unknown)
export function resolveExerciseTag(name) {
  if (!name) return null;
  if (EX_DB[name]) return EX_DB[name];
  const lower = name.toLowerCase().trim();
  // Case-insensitive exact
  const ci = Object.entries(EX_DB).find(([k]) => k.toLowerCase() === lower);
  if (ci) return ci[1];
  // Input contains a known exercise name ("machine bench press" → "Bench Press")
  const partial = Object.entries(EX_DB).find(([k]) => lower.includes(k.toLowerCase()));
  if (partial) return partial[1];
  // All words of a DB name appear in the input
  const reversed = Object.entries(EX_DB).find(([k]) => k.toLowerCase().split(" ").every(w => lower.includes(w)));
  if (reversed) return reversed[1];

  // ── EXPANDED KEYWORD INFERENCE ──────────────────────────────────────────
  // Flags used across patterns
  const isRear    = /\b(rear|reverse|bent.?over)\b/.test(lower);
  const hasPull   = /\b(pull|row|chin|lat)\b/.test(lower);
  const hasLeg    = /\b(leg|hip|glute|hamstring|quad)\b/.test(lower);

  // ── CHEST: pec (any variant), fly/flye (non-rear), bench, push-up, crossover
  if (!isRear && (
    lower.includes("pec") ||
    /\bflyes?\b/.test(lower) ||
    /\b(bench|chest press|incline press|chest fly|cable fly|machine chest|machine incline|push.?up|crossover|dumbbell press|db press)\b/.test(lower)
  )) return {primary:"chest", secondary:["triceps"], movement:"horizontal_push", stim:7};

  // ── BACK: rows, pulldowns, pull-ups, cable pulls, machine back
  if (/\b(row|lat pull|pulldown|pull.?up|chin.?up|pullover|t.?bar|seated cable|low row|machine row|cable row|v.?bar|single arm row|chest supported|wide grip pull)\b/.test(lower))
    return {primary:"back",   secondary:["biceps"],   movement:"horizontal_pull", stim:7};

  // ── QUADS
  if (/\b(squat|leg press|lunge|hack|pendulum|leg ext|step.?up|split squat|wall sit)\b/.test(lower))
    return {primary:"quads",  secondary:["glutes"],   movement:"squat",          stim:7};

  // ── HAMSTRINGS / GLUTES
  if (/\b(rdl|romanian|stiff.?leg|leg curl|hamstring|nordic|hip thrust|glute bridge|glute|sumo|deadlift)\b/.test(lower))
    return {primary:"hams",   secondary:["glutes"],   movement:"hinge",          stim:7};

  // ── REAR DELT (check before general delts)
  if (isRear || /\b(face pull|reverse fly|rear fly|rear delt|cable pull.?apart|band pull.?apart|prone y|prone t)\b/.test(lower))
    return {primary:"rear_delt", secondary:["back"], movement:"fly",            stim:7};

  // ── DELTS: shoulder, press (non-chest context), lateral, upright, overhead
  if (/\b(overhead press|ohp|shoulder press|arnold|lateral raise|side raise|upright|machine shoulder|shoulder|pike|military press|dumbbell shoulder)\b/.test(lower))
    return {primary:"delts",  secondary:["triceps"],  movement:"vertical_push",  stim:7};

  // ── TRICEPS: pushdown, extension, dip, kickback — guard against leg/back
  if (!hasLeg && /\b(tricep|skull.?crusher|push.?down|overhead ext|jm press|rope push|tate press|dip|kickback|close.?grip|cable extension|tricep machine)\b/.test(lower))
    return {primary:"triceps",secondary:[],           movement:"isolation",      stim:7};

  // ── BICEPS: curl, hammer, preacher, zottman, spider
  if (/\b(curl|bicep|preacher|concentration|hammer|zottman|spider|incline curl|cable curl)\b/.test(lower))
    return {primary:"biceps", secondary:[],           movement:"isolation",      stim:7};

  // ── CALVES
  if (/\b(calf|calves|calf raise|standing raise|seated raise)\b/.test(lower))
    return {primary:"calves", secondary:[],           movement:"isolation",      stim:7};

  // ── ABS: crunch, plank, core, sit-up, cable crunch, russian twist
  if (/\b(ab |abs|crunch|plank|core|sit.?up|leg raise|toes.?to.?bar|cable crunch|russian twist|hollow|v.?up|decline crunch)\b/.test(lower))
    return {primary:"abs",    secondary:[],           movement:"isometric",      stim:6};

  return null;
}

// ── MUSCLE BALANCE BENCHMARKS (sets/week) ─────────────────────────────────────
export const MUSCLE_BENCHMARKS = {
  chest:     {label:"Chest",    color:"#F5A623",mev:8, mav:16,mrv:20},
  back:      {label:"Back",     color:"#3DDC84",mev:10,mav:18,mrv:22},
  quads:     {label:"Quads",    color:"#5B8FF9",mev:8, mav:16,mrv:20},
  hams:      {label:"Hams",     color:"#A78BFA",mev:6, mav:12,mrv:16},
  delts:     {label:"Delts",    color:"#FB7185",mev:8, mav:16,mrv:20},
  rear_delt: {label:"Rear Delt",color:"#F472B6",mev:6, mav:12,mrv:16},
  triceps:   {label:"Triceps",  color:"#34D399",mev:6, mav:12,mrv:16},
  biceps:    {label:"Biceps",   color:"#60A5FA",mev:6, mav:12,mrv:16},
  calves:    {label:"Calves",   color:"#FBBF24",mev:8, mav:16,mrv:20},
  abs:       {label:"Abs",      color:"#E879F9",mev:4, mav:10,mrv:14},
};

// ── MUSCLE VOLUME ANALYTICS ───────────────────────────────────────────────────
export function computeMuscleVolume(history, windowDays=7) {
  const cutoff = Date.now() - windowDays * 86400000;
  const recent = history.filter(s => s.ts >= cutoff);
  const vol = {};
  Object.keys(MUSCLE_BENCHMARKS).forEach(m => { vol[m] = {sets:0,freq:0,lastTs:0}; });
  recent.forEach(sess => {
    (sess.completedExercises||[]).forEach(ex => {
      // Use stored tag first (custom sessions), then EX_DB exact, then fuzzy resolver
      // If stored tag has primary:"custom" it was never properly resolved —
      // fall through to EX_DB + keyword inference so sets count correctly.
      const storedTag = ex.tag?.primary && ex.tag.primary !== "custom" ? ex.tag : null;
      const tag = storedTag || EX_DB[ex.name] || resolveExerciseTag(ex.name);
      if (!tag || !tag.primary) return;
      const sets = (ex.loggedSets||[]).filter(s=>s.reps).length;
      if (vol[tag.primary]) { vol[tag.primary].sets+=sets; vol[tag.primary].freq+=1; vol[tag.primary].lastTs=Math.max(vol[tag.primary].lastTs,sess.ts); }
      (tag.secondary||[]).forEach(sec => { if(vol[sec]) vol[sec].sets+=sets*0.5; });
    });
  });
  return vol;
}

// ── MUSCLE ALERTS ─────────────────────────────────────────────────────────────
export function generateMuscleAlerts(muscleVol, level, C) {
  const mod = {beginner:.7,intermediate:1,advanced:1.2,competitor:1.4}[level]||1;
  const alerts = [];
  Object.entries(MUSCLE_BENCHMARKS).forEach(([key,bench]) => {
    const v = muscleVol[key]; if(!v) return;
    const mev=bench.mev*mod, mrv=bench.mrv;
    if (v.sets===0) alerts.push({key,muscle:bench.label,severity:"critical",msg:`${bench.label}: 0 sets this week — add ${Math.round(mev)} sets minimum (MEV) to stimulate growth.`,color:C.red});
    else if (v.sets<mev) alerts.push({key,muscle:bench.label,severity:"warning",msg:`${bench.label}: ${Math.round(v.sets)} sets logged, ${Math.round(mev)} needed to reach MEV (minimum effective volume).`,color:"#FBBF24"});
    else if (v.sets>mrv) alerts.push({key,muscle:bench.label,severity:"overreach",msg:`${bench.label}: ${Math.round(v.sets)} sets exceeds MRV (${mrv}) — reduce volume to protect recovery.`,color:C.blue});
  });
  return alerts.sort((a,b)=>a.severity==="critical"?-1:b.severity==="critical"?1:0);
}
// ── SPLIT DEFINITIONS ─────────────────────────────────────────────────────────
export const PPL_6DAY_PRESET = {
  push1: [
    { id:"p1_1", name:"Barbell Press (Incline or Flat)", muscle:"chest",   category:"compound",  sets:4, repRange:"6–10",    rpe:8, targetSets:4, notes:"Heavy working sets — lead with chest, control descent" },
    { id:"p1_2", name:"Alternated Dumbbell Shoulder Press", muscle:"delts", category:"compound", sets:4, repRange:"8–12",    rpe:8, targetSets:4, notes:"One arm at a time — full ROM and core stability" },
    { id:"p1_3", name:"Chest Flies",       muscle:"chest",   category:"isolation", sets:3, repRange:"10–15",   rpe:7, targetSets:3, notes:"Superset with Tricep Extensions — deep stretch at bottom" },
    { id:"p1_4", name:"Tricep Extensions", muscle:"triceps", category:"isolation", sets:4, repRange:"10–15",   rpe:7, targetSets:4, notes:"Superset with Chest Flies — full lockout at top" },
    { id:"p1_5", name:"Lateral Raises",    muscle:"delts",   category:"isolation", sets:4, repRange:"12–15",   rpe:7, targetSets:4, notes:"Lead with elbow, slight bend — standard working sets" },
    { id:"p1_6", name:"Dips",              muscle:"triceps", category:"compound",  sets:3, repRange:"To Failure", rpe:9, targetSets:3, notes:"To failure — control descent, full lockout at top" },
  ],
  pull1: [
    { id:"pu1_1", name:"Lat Pull Downs",               muscle:"back",    category:"compound",  sets:4, repRange:"10–15",   rpe:7, targetSets:4, notes:"Start light — focus on contraction, feel the lat stretch" },
    { id:"pu1_2", name:"Bent Over Rows",                muscle:"back",    category:"compound",  sets:4, repRange:"6–10",    rpe:8, targetSets:4, notes:"Heavy working sets — brace core, drive elbows back" },
    { id:"pu1_3", name:"Incline Seated Dumbbell Curls", muscle:"biceps",  category:"isolation", sets:4, repRange:"10–15",   rpe:7, targetSets:4, notes:"Light weight, constant tension — full stretch at bottom" },
    { id:"pu1_4", name:"Pull-ups",                      muscle:"back",    category:"compound",  sets:3, repRange:"To Failure", rpe:9, targetSets:3, notes:"To failure — full hang at bottom, chin over bar" },
    { id:"pu1_5", name:"EZ Bar Curls",                  muscle:"biceps",  category:"isolation", sets:2, repRange:"40 sec", rpe:8, targetSets:2, notes:"2 sets of 40 seconds constant tension — no rest at top or bottom" },
  ],
  legs1: [
    { id:"l1_1", name:"Lunges",                muscle:"quads",  category:"compound",  sets:4, repRange:"15/leg",  rpe:7, targetSets:4, notes:"Bodyweight warm-up then heavy — 15 steps per leg, upright torso" },
    { id:"l1_2", name:"Romanian Deadlift",     muscle:"hams",   category:"compound",  sets:4, repRange:"8–12",    rpe:8, targetSets:4, notes:"Focus on movement — hip hinge, feel the hamstring stretch" },
    { id:"l1_3", name:"Hip Thrusts",           muscle:"hams",   category:"isolation", sets:3, repRange:"12–15",   rpe:7, targetSets:3, notes:"Or kickbacks — squeeze glutes hard at top" },
    { id:"l1_4", name:"Seated Calf Raises",    muscle:"calves", category:"isolation", sets:6, repRange:"10–12",   rpe:7, targetSets:6, notes:"6 sets total — last 4 supersetted with Lying Hamstring Curls" },
    { id:"l1_5", name:"Lying Hamstring Curls", muscle:"hams",   category:"isolation", sets:4, repRange:"8–10 / 40s", rpe:7, targetSets:4, notes:"2 sets 8–10 reps + 2 sets 40 seconds — superset with calf raises" },
  ],
  push2: [
    { id:"p2_1", name:"Close Grip Bench Press",      muscle:"triceps", category:"compound",  sets:3, repRange:"8–12",    rpe:8, targetSets:3, notes:"3 working sets — elbows close, full lockout" },
    { id:"p2_2", name:"Standing Barbell Press",      muscle:"delts",   category:"compound",  sets:4, repRange:"6–10",    rpe:8, targetSets:4, notes:"Heavy working sets — brace core, no lower back lean" },
    { id:"p2_3", name:"Pec Deck Flies",              muscle:"chest",   category:"isolation", sets:2, repRange:"40 sec",  rpe:7, targetSets:2, notes:"2 sets of 40 seconds constant tension — squeeze at peak contraction" },
    { id:"p2_4", name:"Overhead Tricep Extension",   muscle:"triceps", category:"isolation", sets:3, repRange:"10–15",   rpe:7, targetSets:3, notes:"Deep stretch focus — full range, feel the long head load" },
    { id:"p2_5", name:"Lateral Raises",              muscle:"delts",   category:"isolation", sets:4, repRange:"10–12",   rpe:7, targetSets:4, notes:"Superset with Push-ups — lead with elbow" },
    { id:"p2_6", name:"Push-ups",                    muscle:"chest",   category:"compound",  sets:4, repRange:"To Failure", rpe:8, targetSets:4, notes:"Superset with Lateral Raises — to failure each set" },
  ],
  pull2: [
    { id:"pu2_1", name:"Pull-ups",               muscle:"back",   category:"compound",  sets:3, repRange:"8–12",     rpe:8, targetSets:3, notes:"3 sets — full hang at bottom, chest to bar" },
    { id:"pu2_2", name:"Rack Pulls",             muscle:"back",   category:"compound",  sets:2, repRange:"8–10",     rpe:8, targetSets:2, notes:"2 working sets — upper back and trap engagement" },
    { id:"pu2_3", name:"Hammer Curls",           muscle:"biceps", category:"isolation", sets:3, repRange:"10–12",    rpe:7, targetSets:3, notes:"Brachialis emphasis — control the descent" },
    { id:"pu2_4", name:"Reverse Grip Row",       muscle:"back",   category:"compound",  sets:3, repRange:"10–12",    rpe:7, targetSets:3, notes:"Or pull down — focus on elbow positioning, pull to waist" },
    { id:"pu2_5", name:"Cable Curls",            muscle:"biceps", category:"isolation", sets:3, repRange:"10–15",    rpe:7, targetSets:3, notes:"Constant tension — squeeze at top, slow negative" },
    { id:"pu2_6", name:"Dumbbell Curls Drop Set",muscle:"biceps", category:"isolation", sets:1, repRange:"~4 drops", rpe:9, targetSets:1, notes:"1 big drop set ~4 drops — take to failure each drop" },
  ],
  legs2: [
    { id:"l2_1", name:"Squats",               muscle:"quads",  category:"compound",  sets:7, repRange:"8–10",     rpe:8, targetSets:7, notes:"3 warm-up + 3 working sets + 1 final heavy — depth below parallel" },
    { id:"l2_2", name:"Leg Press",            muscle:"quads",  category:"compound",  sets:2, repRange:"40 sec",   rpe:8, targetSets:2, notes:"Superset with Calf Raises — 2 sets 40 seconds constant tension" },
    { id:"l2_3", name:"Calf Raises",          muscle:"calves", category:"isolation", sets:2, repRange:"To Failure",rpe:8, targetSets:2, notes:"Superset with Leg Press — to failure" },
    { id:"l2_4", name:"Hip Adductors",        muscle:"hams",   category:"isolation", sets:1, repRange:"12–15",    rpe:7, targetSets:1, notes:"1 set — inner thigh squeeze, controlled movement" },
    { id:"l2_5", name:"Standing Calf Raises", muscle:"calves", category:"isolation", sets:4, repRange:"10–12",    rpe:7, targetSets:4, notes:"4 sets + bounce reps to failure on last set" },
    { id:"l2_6", name:"Quad Extensions",      muscle:"quads",  category:"isolation", sets:4, repRange:"10–12",    rpe:7, targetSets:4, notes:"2 sets 10–12 reps + 2 triple drop sets — peak contraction focus" },
  ],
};

export const PPL_UL_5DAY_PRESET = {
  upper: [
    { id:"u1", name:"Bench Press",            muscle:"chest",   category:"compound",  sets:3, repRange:"1×2–5, 2×3–8",   rpe:3, targetSets:3, notes:"First set heavier — work up to a top set, then back off 10–15% for the remaining two" },
    { id:"u2", name:"Weighted Chin-ups",       muscle:"back",    category:"compound",  sets:3, repRange:"1×5–8, 2×6–10",  rpe:3, targetSets:3, notes:"Add weight via belt — full hang at bottom, chin clears bar at top" },
    { id:"u3", name:"Incline Dumbbell Fly",    muscle:"chest",   category:"isolation", sets:3, repRange:"10–15",            rpe:4, targetSets:3, notes:"Deep stretch at bottom, squeeze at peak — keep elbows slightly soft" },
    { id:"u4", name:"Chest-Supported Row",     muscle:"back",    category:"compound",  sets:4, repRange:"8–12",             rpe:4, targetSets:4, notes:"Chest on pad removes lower back from the equation — focus entirely on elbow drive" },
    { id:"u5", name:"Rope Pressdown",          muscle:"triceps", category:"isolation", sets:3, repRange:"12–20",            rpe:5, targetSets:3, notes:"Spread the rope at the bottom — feel the long head stretch at top" },
    { id:"u6", name:"Dumbbell Lateral Raise",  muscle:"delts",   category:"isolation", sets:3, repRange:"8–12",             rpe:5, targetSets:3, notes:"Lead with elbow, not wrist — slight forward lean amplifies medial delt" },
  ],
  lower1: [
    { id:"l1_1", name:"Squat",                 muscle:"quads",  category:"compound",  sets:3, repRange:"1×2–4, 2×3–6",   rpe:3, targetSets:3, notes:"Top set then back-off — brace hard, depth below parallel, knees track over toes" },
    { id:"l1_2", name:"Romanian Deadlift",     muscle:"hams",   category:"compound",  sets:3, repRange:"6–10",             rpe:3, targetSets:3, notes:"Hip hinge — maintain tension in hamstrings throughout, no lower back rounding" },
    { id:"l1_3", name:"Barbell Back Extension",muscle:"hams",   category:"isolation", sets:3, repRange:"8–12",             rpe:4, targetSets:3, notes:"Hold at top — glute and hamstring initiation, not lower back" },
    { id:"l1_4", name:"Leg Extension",         muscle:"quads",  category:"isolation", sets:3, repRange:"10–15",            rpe:5, targetSets:3, notes:"Peak contraction at top — slow the negative, 2–3 second eccentric" },
    { id:"l1_5", name:"Lying Bicep Curl",      muscle:"biceps", category:"isolation", sets:4, repRange:"6–10",             rpe:4, targetSets:4, notes:"Lie on incline bench — full stretch at bottom provides constant tension" },
    { id:"l1_6", name:"Machine Calf Raise",    muscle:"calves", category:"isolation", sets:4, repRange:"10–15 / 3–5",     rpe:4, targetSets:4, notes:"1 higher-rep set then heavier sets — full range, pause at stretch and peak" },
  ],
  pull: [
    { id:"pu1", name:"Meadows Row",                    muscle:"back",   category:"compound",  sets:3, repRange:"6–10",   rpe:3, targetSets:3, notes:"T-bar style landmine row — elbow flares slightly, drive through the hip" },
    { id:"pu2", name:"Cable Row",                      muscle:"back",   category:"compound",  sets:3, repRange:"8–12",   rpe:4, targetSets:3, notes:"Sit tall — retract scapula at peak contraction, controlled return" },
    { id:"pu3", name:"Reverse Grip Lat Pulldown",      muscle:"back",   category:"compound",  sets:3, repRange:"10–15",  rpe:4, targetSets:3, notes:"Supinated grip engages biceps and lower lats — pull to upper chest" },
    { id:"pu4", name:"Dumbbell Lateral Raise",         muscle:"delts",  category:"isolation", sets:4, repRange:"12–20",  rpe:5, targetSets:4, notes:"Higher reps here — chase the burn, control the eccentric" },
    { id:"pu5", name:"Face Pull",                      muscle:"delts",  category:"isolation", sets:3, repRange:"12–20",  rpe:5, targetSets:3, notes:"Pull to face level, external rotation at peak — shoulder health essential" },
    { id:"pu6", name:"Barbell Shrug",                  muscle:"back",   category:"isolation", sets:3, repRange:"8–12",   rpe:4, targetSets:3, notes:"Straight up — no rolling, hold 1 second at top, full depression at bottom" },
  ],
  push: [
    { id:"ph1", name:"Weighted Dips",           muscle:"chest",   category:"compound",  sets:3, repRange:"5–8",    rpe:3, targetSets:3, notes:"Lean forward for chest emphasis — full lockout at top, deep stretch at bottom" },
    { id:"ph2", name:"Close-Grip Bench Press",  muscle:"triceps", category:"compound",  sets:3, repRange:"6–10",   rpe:3, targetSets:3, notes:"Elbows close to torso — tricep dominant, feel the long head load at bottom" },
    { id:"ph3", name:"Seated Dumbbell Curl",    muscle:"biceps",  category:"isolation", sets:3, repRange:"8–12",   rpe:4, targetSets:3, notes:"Seated removes cheating — supinate at top, slow negative" },
    { id:"ph4", name:"Machine Overhead Press",  muscle:"delts",   category:"compound",  sets:3, repRange:"8–12",   rpe:4, targetSets:3, notes:"Seated machine stabilizes — full lockout overhead, controlled descent" },
    { id:"ph5", name:"EZ Bar Skull Crusher",    muscle:"triceps", category:"isolation", sets:3, repRange:"6–10",   rpe:4, targetSets:3, notes:"Lower to forehead — long head stretch, explode on the concentric" },
    { id:"ph6", name:"Cable Hammer Curl",       muscle:"biceps",  category:"isolation", sets:3, repRange:"10–15",  rpe:5, targetSets:3, notes:"Neutral grip targets brachialis — constant cable tension throughout" },
  ],
  legs: [
    { id:"lg1", name:"Deadlift",                      muscle:"hams",   category:"compound",  sets:2, repRange:"3–5",        rpe:2, targetSets:2, notes:"2 heavy working sets — brace, drive floor away, lock hips and knees together at top" },
    { id:"lg2", name:"Paused Squat",                  muscle:"quads",  category:"compound",  sets:5, repRange:"3–5",        rpe:3, targetSets:5, notes:"2-second pause at the bottom — eliminates stretch reflex, builds raw strength" },
    { id:"lg3", name:"Smith Machine Split Squat",     muscle:"quads",  category:"compound",  sets:3, repRange:"8–12",       rpe:4, targetSets:3, notes:"Front foot elevated — deep range of motion, keep front knee tracking over toe" },
    { id:"lg4", name:"Leg Curl",                      muscle:"hams",   category:"isolation", sets:2, repRange:"10–15",      rpe:4, targetSets:2, notes:"Curl to full contraction — plantar flex foot at peak for extra hamstring peak" },
    { id:"lg5", name:"Leaning Cable Lateral Raise",   muscle:"delts",  category:"isolation", sets:3, repRange:"10–15",      rpe:5, targetSets:3, notes:"Hold cable stack, lean away — stretches medial delt at bottom of each rep" },
    { id:"lg6", name:"Leg Press Calf Raise",          muscle:"calves", category:"isolation", sets:4, repRange:"1×8–12, 3–5", rpe:4, targetSets:4, notes:"Full range — toes on edge of platform, pause at stretch and peak contraction" },
  ],
};

export const SPLITS = {
  ppl: {
    id:"ppl", label:"6-Day Push / Pull / Legs", abbr:"PPL",
    desc:"Six days a week, every muscle trained twice. Heavy compound lifts first, then isolation work, for size and symmetry.",
    frequency:6,
    preset: PPL_6DAY_PRESET,
    schedule: [
      { key:"push1", tag:"Push 1", muscles:["chest","delts","triceps"] },
      { key:"pull1", tag:"Pull 1", muscles:["back","biceps"] },
      { key:"legs1", tag:"Legs 1", muscles:["quads","hams","calves"] },
      { key:"push2", tag:"Push 2", muscles:["chest","delts","triceps"] },
      { key:"pull2", tag:"Pull 2", muscles:["back","biceps"] },
      { key:"legs2", tag:"Legs 2", muscles:["quads","hams","calves"] },
    ],
  },
  ul: {
    id:"ul", label:"Upper / Lower", abbr:"U/L",
    desc:"4-day alternating split. High frequency, manageable volume. Great for all levels.",
    frequency:4,
    schedule: [
      { key:"upper1", tag:"Upper A", muscles:["chest","back","delts","triceps","biceps"] },
      { key:"lower1", tag:"Lower A", muscles:["quads","hams","calves"] },
      { key:"upper2", tag:"Upper B", muscles:["chest","back","delts","triceps","biceps"] },
      { key:"lower2", tag:"Lower B", muscles:["quads","hams","calves"] },
    ],
  },
  pplup: {
    id:"pplup", label:"5-Day Push / Pull / Legs + Upper / Lower", abbr:"PPLUL",
    desc:"Five days a week at moderate volume, about 19–20 sets per session. Upper and lower days give every major muscle a second session.",
    frequency:5,
    preset: PPL_UL_5DAY_PRESET,
    schedule: [
      { key:"upper",  tag:"Upper",   muscles:["chest","back","delts","biceps","triceps"] },
      { key:"lower1", tag:"Lower 1", muscles:["quads","hams","calves","biceps"] },
      { key:"pull",   tag:"Pull",    muscles:["back","delts","biceps","traps"] },
      { key:"push",   tag:"Push",    muscles:["chest","delts","triceps","biceps"] },
      { key:"legs",   tag:"Legs",    muscles:["quads","hams","calves","delts"] },
    ],
  },
};

// ── VOLUME LANDMARKS (sets/muscle/week by level) ──────────────────────────────
export const VOL = {
  beginner:     { mev:6,  mav:12, mrv:16 },
  intermediate: { mev:8,  mav:16, mrv:20 },
  advanced:     { mev:10, mav:18, mrv:22 },
  competitor:   { mev:12, mav:20, mrv:24 },
};

// ── PROGRAM GENERATOR ─────────────────────────────────────────────────────────
// Per-muscle exercise lists derived from EX_DB
export function getExForMuscle(muscle, type) {
  return Object.entries(EX_DB)
    .filter(([, tag]) => tag.primary === muscle && (type === "any" || (type === "compound" ? tag.movement !== "isolation" && tag.movement !== "isometric" : tag.movement === "isolation" || tag.movement === "isometric")))
    .sort(([, a], [, b]) => b.stim - a.stim)
    .map(([name]) => name);
}

export function generateProgram({ split, level, goal, neglectedMuscles=[] }) {
  const splitDef = SPLITS[split];
  const vol = VOL[level] || VOL.intermediate;
  const sessionsPerMuscle = 2;

  function pickExercises(muscleKeys, isB = false) {
    const exs = [];
    muscleKeys.forEach(mKey => {
      const compounds = getExForMuscle(mKey, "compound");
      const isolations = getExForMuscle(mKey, "isolation");
      const setsPerSession = Math.ceil(vol.mav / sessionsPerMuscle / muscleKeys.length);
      const isNeglected = neglectedMuscles.includes(mKey);
      const setsClamp = Math.max(2, Math.min(5, setsPerSession + (isNeglected ? 1 : 0)));
      const notes = isNeglected ? "⚠ Volume boosted — lagging muscle group" : "Focus on full ROM and controlled eccentric";

      const comp = compounds[isB ? Math.min(1, compounds.length - 1) : 0];
      if (comp) {
        exs.push({
          id: `${mKey}_c_${comp.replace(/\s+/g,"")}`,
          name: comp, muscle: mKey,
          category: "compound",
          sets: setsClamp, repRange: goal === "strength" ? "4–6" : "6–10",
          rpe: 8, targetSets: setsClamp, notes,
        });
      }
      if (["chest","back","quads","hams"].includes(mKey) && isolations.length > 0) {
        const iso = isolations[isB ? Math.min(1, isolations.length - 1) : 0];
        exs.push({
          id: `${mKey}_i_${iso.replace(/\s+/g,"")}`,
          name: iso, muscle: mKey, category: "isolation",
          sets: Math.max(2, setsClamp - 1), repRange: "10–15",
          rpe: 7, targetSets: Math.max(2, setsClamp - 1),
          notes: "Mind-muscle connection priority",
        });
      } else if (["biceps","triceps","calves","abs","delts","rear_delt"].includes(mKey) && isolations.length > 0) {
        const iso = isolations[isB ? Math.min(1, isolations.length - 1) : 0];
        exs.push({
          id: `${mKey}_i_${iso.replace(/\s+/g,"")}`,
          name: iso, muscle: mKey, category: "isolation",
          sets: 3, repRange: ["biceps","triceps"].includes(mKey) ? "8–12" : "15–20",
          rpe: 7, targetSets: 3, notes: "",
        });
      }
    });
    return exs;
  }

  const program = {};
  splitDef.schedule.forEach(day => {
    const isB = day.key.endsWith("2") || day.tag.includes("B");
    const exercises = splitDef.preset?.[day.key] ?? pickExercises(day.muscles, isB);
    program[day.key] = { tag: day.tag, muscles: day.muscles, exercises };
  });
  return program;
}

// ── ADAPTATION ENGINE ─────────────────────────────────────────────────────────
export function runAdaptation({ program, history, level }) {
  if (!history || history.length < 2) return { adjustments: {}, signal: "neutral", note: "Keep logging sessions to unlock adaptive programming." };

  const vol = VOL[level] || VOL.intermediate;
  const recent = history.slice(-4); // last 4 sessions of each day type

  // Group history by day key
  const byDay = {};
  history.forEach(h => {
    if (!byDay[h.dayKey]) byDay[h.dayKey] = [];
    byDay[h.dayKey].push(h);
  });

  const adjustments = {};
  let signals = [];

  Object.entries(byDay).forEach(([dayKey, sessions]) => {
    if (sessions.length < 2) return;
    const last = sessions[sessions.length - 1];
    const prev = sessions[sessions.length - 2];

    // Compute total volume load: sum(sets * reps * weight) per session
    const calcVol = (sess) => (sess.completedExercises || []).reduce((sum, ex) => {
      return sum + (ex.loggedSets || []).reduce((s2, set) => s2 + (set.reps || 0) * (set.weight || 0), 0);
    }, 0);
    const lastVol = calcVol(last);
    const prevVol = calcVol(prev);
    const volDelta = prevVol > 0 ? (lastVol - prevVol) / prevVol : 0;

    // Compute avg RPE
    const avgRpe = (sess) => {
      const allSets = (sess.completedExercises || []).flatMap(ex => ex.loggedSets || []);
      const rpeSets = allSets.filter(s => s.rpe);
      return rpeSets.length ? rpeSets.reduce((s, x) => s + x.rpe, 0) / rpeSets.length : 7;
    };
    const lastRpe = avgRpe(last);

    // Determine signal
    let signal, setDelta = 0, note = "";
    if (volDelta > 0.05 && lastRpe < 8.5) {
      signal = "progress";
      setDelta = +1;
      note = "Volume increasing well. Adding 1 set to compounds.";
    } else if (lastRpe > 9 || volDelta < -0.1) {
      signal = "fatigue";
      setDelta = -1;
      note = "High RPE or volume drop detected. Reducing volume slightly.";
    } else if (sessions.length >= 3 && Math.abs(volDelta) < 0.03) {
      signal = "stall";
      setDelta = 0;
      note = "Volume stable. Consider increasing load targets by 2.5–5 lbs.";
    } else {
      signal = "neutral";
      setDelta = 0;
      note = "Progressing normally. Stay the course.";
    }

    adjustments[dayKey] = { signal, setDelta, lastVol, lastRpe: lastRpe.toFixed(1), note };
    signals.push(signal);
  });

  const dominantSignal = signals.includes("fatigue") ? "fatigue"
    : signals.filter(s => s === "progress").length > signals.length / 2 ? "progress"
    : signals.includes("stall") ? "stall" : "neutral";

  return { adjustments, signal: dominantSignal, note: Object.values(adjustments)[0]?.note || "Keep training consistently." };
}

