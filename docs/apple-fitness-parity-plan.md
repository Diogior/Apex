# Apex: plan to reach Apple Fitness quality

Written 2026-10-14, from a full read of `src/App.jsx` and a walkthrough of the app
(onboarding, Home, Training, Nutrition, Coach) on a 390 px phone in dark mode.

## Where Apex stands

**Ahead of Apple Fitness for its audience.** Apple Fitness doesn't do any of this:
- an adaptive training engine that uses RPE and per-muscle volume landmarks (MEV / MAV / MRV)
- macro targets that change with the goal
- reverse-diet and contest-prep protocols
- weekly check-ins and physique check-ins
- an AI coach that knows the user's plan

Keep all of it.

**Behind Apple Fitness on feel.** The gap is presentation and flow, not features:

1. **The look contradicts Apex's own design brief.** `.impeccable.md` asks for Apple-style
   restraint. What ships instead:
   - all-caps Bebas Neue headings
   - "neobrutalist" hard borders and offset shadows
   - four typefaces (Bebas, DM Sans, DM Mono, Fraunces)
   - five accent colours used decoratively
2. **No at-a-glance status.** Apple opens on three rings. Apex Home opens on a weight-entry
   form; the only ring is on Nutrition.
3. **Too many interruptions.** A new user sees, back to back:
   - the welcome carousel
   - a tab tooltip
   - a "No weight logged today" banner on every tab, covering each screen's title
   - a Weekly Check-in sheet that opens on top of Home by itself
4. **Workout logging is a form, not an experience.** There's no full-screen live workout,
   no rest ring, and no effort rating at the end.
5. **No trends, awards or celebrations.** Progress shows up as numbers, never as moments.
6. **Web-only limits.** No Apple Health data (steps, heart rate, sleep), no push
   notifications, no haptics on iPhone.

**Risks to fix first, whatever else happens:**
- `api/chat.js` forwards any request to Anthropic using your key. It doesn't check who is
  calling, which model, or how many tokens, so anyone who finds the URL can spend your credit.
- **Admin access depends only on an email string,** checked in client code and in
  `firestore.rules`. The rules don't require a verified email or a custom claim.
- **A training program uses a real person's name.** "Mr. Olympia's PPL Split" is billed as
  "Chris Bumstead's 6-day program ... a 5x Mr. Olympia physique". That uses a real person's
  name to sell a program and is also wrong: his titles are Classic Physique Olympia, not
  Mr. Olympia.
- **One missing field blanks the whole app.** No error boundary means one bad value shows a
  blank screen (seen during this review when `metadata.creationTime` was missing).
- **The whole app is a single 10,489-line file with no tests.** Every change here is risky
  until it's split and the engine maths is tested.

## Decisions

| Decision | Status |
|---|---|
| **What the three rings measure** | **Decided 2026-10-14: Train · Fuel · Track** (definitions below) |
| **Visual direction** | **Decided 2026-10-14: drop the brutalist look.** Follow the brief: system font (SF Pro on iPhone), sentence case, soft surfaces, one accent plus ring colours. |
| **Platform** | Open. Recommendation: wrap with Capacitor after Phase 3 for Apple Health, push notifications and haptics, reusing the React code. Apple Watch stays out of scope (needs Swift). |

**The rings:**

| Ring | Closes when | Why |
|---|---|---|
| **Train** | Today's planned sets are done (rest days close on a logged check-in) | Matches Apple's Exercise ring |
| **Fuel** | Protein target hit, with calories inside the goal's band | Protein is the number this audience lives by |
| **Track** | Weigh-in, meals and check-in logged (three equal parts) | Turns the daily data habit into a visible goal instead of a nag banner |

Ring colours must pass the colour-blindness check (`dataviz` validator) in both light and dark.

## Phases

### Phase 0: Make it safe to change (about 1 to 2 weeks)

**Status (2026-10-14, branch `phase-0/foundations`):** done in code, three steps need you.
- **Done:**
  - `api/chat.js` checks the Firebase token, model allowlist, a 1,500-token cap, body size
    and a per-user rate limit. The client sends the token through `src/lib/apiChat.js`.
  - Admin access is now the `admin` custom claim, in both the client and `firestore.rules`.
  - The programs are renamed.
  - Error boundaries wrap every tab and the app root.
  - The engine, training engine, theme colours and stylesheet are split out of `App.jsx`
    (10,489 → about 8,000 lines).
  - 31 Vitest tests cover them.
- **Bug found and fixed:** `calcProtocol` (Rebound / reverse-diet calculator) referenced a
  colour object that didn't exist, so it threw on every run.
- **Your steps:**
  1. In Vercel, make sure `FIREBASE_PROJECT_ID` (or the existing `VITE_FB_PROJECT_ID`) is set
     for the serverless function.
  2. Grant yourself the claim: `node scripts/set-admin-claim.mjs <your email>`. Instructions
     are in the file, and it needs a service-account key kept outside the repo.
  3. Deploy the rules: `npx firebase-tools deploy --only firestore:rules`. Then sign out and
     back in.
- **Left for later:**
  - Screens stay in `App.jsx` and move into `src/screens/` as each one is rebuilt in Phases 1–2.
    No point moving code that's about to be rewritten.
- **Open question:** the 5-day program stores `rpe: 3` and `rpe: 4`, which look like
  reps-in-reserve rather than RPE. Confirm before changing, because it affects adaptation.

- **Lock down `api/chat.js`:**
  - require a Firebase ID token
  - allow only approved models, with a `max_tokens` cap
  - rate-limit per user
- **Admin access:** use a Firebase custom claim (`admin: true`) instead of the email string,
  in both the client and `firestore.rules`.
- **Programs:** rename the program to "6-Day Push / Pull / Legs" and drop the real-person claims.
- **Error boundary:** add one around each tab and the workout, with a "Reload" fallback.
- **Split `App.jsx` into folders:**
  - `domain/` (TDEE, rates, volume landmarks, progression)
  - `data/` (storage, sync)
  - `screens/`
  - `components/`
- **Tests:** add Vitest tests for every formula in `domain/` before touching the UI.

### Phase 1: Design system reset (about 2 weeks)
- **Type:**
  - font stack `-apple-system, "SF Pro Text", system-ui`
  - big numbers in `ui-rounded` (SF Pro Rounded), as Apple Fitness does
  - sentence case everywhere
  - drop Bebas, DM Mono and Fraunces
- **Shape:** three corner sizes (12 / 16 / 22), no hard borders or offset shadows, an 8 pt
  spacing grid, 44 pt touch targets.
- **Colour:**
  - one brand accent (gold) for actions
  - three ring colours for status, used nowhere else
  - neutral greys for everything else
  - tested in light and dark
- **Tab bar:** translucent with blur, outline icons that fill when selected, no boxed tabs.
- **Motion:** spring transitions between screens, numbers that count up, nothing that loops forever.
- **Writing:** retire shouting labels ("NO WEIGHT LOGGED TODAY", "LOG FIRST MEAL ▶").

### Phase 2: Summary screen, Apex's version of Apple's Fitness tab (about 2 weeks)
- **Hero:** the three rings with today's values, and a 7-day ring history underneath.
- **One "Next" card** replaces the weigh-in banner, the auto-opening check-in sheet and the
  setup prompts. It shows only the single most useful action right now:
  - start today's session
  - log a weigh-in
  - do the weekly check-in
- **Cards in a fixed order:**
  - Today's session
  - Nutrition (macro bars)
  - Body weight (trend line, rate versus the goal band)
  - Physique target progress
  - Recent sessions
- **First run:**
  - shorten the welcome carousel to one screen
  - no tooltips on top of sheets
  - the check-in waits until day 7

### Phase 3: Workout experience (about 2 to 3 weeks)
- **Live workout:**
  - full-screen, with a large elapsed time
  - one focused exercise at a time and a preview of what's next
  - swipe or tap to move between sets
- **Rest timer:**
  - shown as a closing ring
  - optional sound and vibration
  - keeps the screen awake (Wake Lock API)
- **End of workout:**
  - an effort rating from 1 to 10 (as in watchOS)
  - it feeds the existing RPE engine
- **Summary screen:**
  - time, sets, volume and personal records
  - what changes next session ("Incline press +5 lb")
- **Session detail:** per-exercise charts (estimated 1-rep max, volume) from history.

### Phase 4: Trends, awards and celebrations (about 2 weeks)
- **Trends**, compared with your 90-day average as Apple does:
  - rate of weight change
  - protein adherence
  - weekly volume per muscle
  - estimated 1-rep max on key lifts
- **Awards:**
  - streaks (Track ring closed X days in a row)
  - personal records
  - prep milestones
  - a personal monthly challenge
- **Celebration:** a short animation (plus haptic on iPhone) when a ring closes or a record falls.

### Phase 5: Native layer with Capacitor (about 3 to 4 weeks, App Store review included)
- **Apple Health, read:** steps, active energy, heart rate, sleep, body weight. These feed
  the Track and Fuel rings and the coach.
- **Apple Health, write:** workouts and weigh-ins, so Apex shows up in Apple's own Fitness app.
- **Notifications:** local and push, replacing in-app banners:
  - a weigh-in reminder
  - "You can still close your Fuel ring"
  - the weekly check-in
- **Haptics:** on set complete, ring close and timer end.

### Phase 6: Sharing and guided content (later)
- **Sharing:** with friends or a coach, built on the existing admin roster but invite-based.
- **Competitions:** small group challenges.
- **Exercise technique videos.** Needs a licensed or self-produced video library.

**Out of scope:** an Apple Watch app (needs watchOS and Swift), and full Fitness+-style
guided classes.

## How we'll know it's on par

- **30-second check:** a returning user can tell their status, next action and trend
  without scrolling.
- **Logging speed:** a planned set takes one tap.
- **No interruptions:** zero automatic sheets or banners on a normal day.
- **Accessibility:** Lighthouse score of 95 or more; all text 13 pt or larger; contrast passes
  in light and dark.
- **Stability:** no blank screens. Every error lands in a boundary with a way back.
- **Engine safety:** every engine formula is covered by tests before its UI changes.
