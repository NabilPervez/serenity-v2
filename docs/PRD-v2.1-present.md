# PRD — Serenity v2.1: "Present" section + Quiet Precision redesign

| | |
|---|---|
| **Owner** | Nabil Pervez |
| **Date** | 2026-11-03 |
| **Status** | Draft |
| **Repo** | github.com/NabilPervez/serenity-v2 |
| **Live** | serenity-v2-app.netlify.app |
| **Stack** | React + Vite, Dexie (IndexedDB), Recharts — unchanged |
| **Design** | web-design-cisco ("Quiet Precision"), Style Library page `402f5f90-88ee-8114-a157-e70febe1afba` |

---

## 1. Summary

Two changes to Serenity v2:

1. **New section: "Present."** A dedicated area for daily mindfulness practice built on one idea: *happiness is existing in the moment, with no judgment.* It holds five practices: object observation, body scan, the 5-minute distraction reset, judgment awareness, and positive reframing.
2. **Redesign** of the whole app from the current "Tactile Sanctuary" look to Cisco's **Quiet Precision** system: one typeface, closed type scale, one accent ramp, hairlines instead of shadows, generous space, short copy.

## 2. Problem

- Serenity v2 covers *reset → maintain → wind-down* (checklist, box breathing, check-ins, emergency cards). It has no place to **practise presence** on purpose, every day, and track it.
- The exercises are short (60 seconds) and easy to skip without a cue, a timer and a record.
- Distraction is the main failure mode. There's no quick "get back to it" tool.
- The current visual system is busier than the calm the app is meant to create.

## 3. Goals and non-goals

**Goals**
- Make each practice startable in **one tap** and finishable in **≤ 60 seconds**.
- Support the cadence: observation **3× a day**; distraction reset **on demand**.
- Track streaks and counts locally, and fold them into the existing 7-day chart.
- Ship the full Quiet Precision redesign across every existing screen.

**Non-goals**
- No accounts, cloud sync or sharing. Data stays on the device (Dexie), as today.
- No AI coaching or content generation.
- Not a replacement for professional care; no clinical claims.

## 4. Users

Primary: Nabil. One user, on phone (PWA), several short sessions a day.

## 5. Feature spec — "Present" section

New top-level nav item **Present**, alongside the existing sections. Landing view = a short hero ("Be here. No judgment.") and five practice rows (expanding-spine pattern, one open at a time), plus today's progress.

### 5.1 Object observation (Assignment 1)
- **What:** Look at one object for 60 seconds and describe it with no judgments.
- **Two monologues:** UI prompts both an **internal** (silent) pass and an **external** (spoken aloud) pass. User picks *Internal*, *External*, or *Both* before starting.
- **Progression:** Two stages — **Objects** → **Food**. Food unlocks after **14 completed object sessions** *(estimate; tunable in settings)*. User can switch manually at any time.
- **Flow:** Pick stage → pick monologue mode → 60s timer (soft chime at start/end, haptic on mobile) → optional one-line note ("What did you notice?") → done.
- **Prompt cards** (rotating, neutral): "Colour. Shape. Texture. Weight. Light." Facts only, no adjectives like *nice/ugly*.
- **Target:** 3 sessions/day. Today's dots: ○○○ → ●●●.
- **Reminders:** Three optional daily local notifications (default 9:00, 13:00, 19:00; editable).

### 5.2 Body focus (Assignment 1b)
- **What:** Same as 5.1, but focus on one body part and notice how it feels for 60 seconds, without judging it.
- **Flow:** Pick a body part from a simple list (hands, feet, shoulders, jaw, chest, stomach, back, "random") → monologue mode → 60s timer → optional note.
- Counts toward its own daily tally (no fixed target; default goal 1/day, editable).

### 5.3 Distraction reset (Assignment 2)
- **What:** When distracted from a task, immediately set a 5-minute alarm, then do the task the moment it fires.
- **UI:** A persistent **"Back to it"** button (in the Present header and as a home-screen shortcut via PWA manifest `shortcuts`).
- **Flow:** Tap → optional 1-line "What was I doing?" (skippable, autofocus) → 5:00 countdown starts → at 0: notification + chime: "Do it now: {task}." → user taps **Started** or **Snooze 5** (snooze limited to once, to keep the rule honest).
- **Log:** Each reset stored (time, task, started/snoozed). Shows "Resets today" and "Started on time %".
- **Tech note:** Web timers are unreliable when the PWA is backgrounded. Use the Notification API with a scheduled fallback; on iOS, also offer **"Set phone alarm"** (deep link copy of the time) because background notifications are limited there. *Flag: needs testing on Nabil's phone.*

### 5.4 Judgment awareness
- **What:** Notice judgments across the day (about self, cooking, how things are done) and reduce them.
- **UI:** A **"Caught one"** tap counter with optional tag: *Self · Food/Cooking · Work · Others · Other*.
- Not a score to minimise; copy frames catching it as the win: "Noticed. That's the practice."
- Weekly view: count by tag (simple bar chart, Recharts).

### 5.5 Positive reframe
- **What:** Turn an event into a positive framing.
- **UI:** Two-field card: **What happened** → **Reframe**. Saved to a reframe journal (newest first).
- **Seed example** (shown once as a sample, deletable):
  - *What happened:* "Jackhammers on the house for 2 days for foundation work."
  - *Reframe:* "The landlord paid to fix the foundation, so for the rest of the lease we'll have no structural issues and every door will work."
- Optional link: a reframe can be started from an Emergency Reset card.

### 5.6 Present dashboard
- Today: observation dots (0–3), body focus count, resets (started %), judgments caught, reframes written.
- Streak: consecutive days with ≥ 1 observation session.
- Existing **7-day adherence vs stress chart** gains a "Present minutes" series.

## 6. Data model (Dexie, new tables)

```
practiceSessions: ++id, type ('object'|'food'|'body'), mode ('internal'|'external'|'both'), target, note, startedAt, durationSec
distractionResets: ++id, task, createdAt, firesAt, outcome ('started'|'snoozed'|'missed'), snoozed
judgments: ++id, tag, createdAt
reframes: ++id, happened, reframe, createdAt
presentSettings: key, value   // reminder times, food-unlock threshold, daily goals
```
Bump Dexie schema version; migration adds tables only (no changes to existing data).

## 7. Redesign — Quiet Precision across the app

Applies to **all** screens (checklist, breathing, check-ins, emergency cards, affirmations, coping skills, chart, Present).

- **Variant:** Light, "trusted advisor" (.com) — white ground, dark text, dark band for the closing/wind-down area. *Decision: chosen because the app is calming and used in daylight; switch to the dark .studio variant if preferred.*
- **Accent:** One calm **sage/teal** hue as a 5-step ramp (focus rings, progress, the one highlighted word). *Not* Khyzr green. Exact values set in `:root` during build.
- **Type:** One family (Outfit, self-hosted). Weights 600 display / 500 UI / 400 prose. Closed scale **62 / 32 / 24 / 22 / 18 / 16 / 14 / 13px** only. Section titles 22–24px. Two-tone headlines (ink + grey).
- **Surfaces:** 1px hairlines (#E7E7E7) instead of card shadows; "cards on one ground" seams for practice tiles; expanding spine for lists.
- **Space:** 8/16/24/32/64 ladder; 16px mobile gutter; no horizontal scroll.
- **Motion:** `cubic-bezier(.16,1,.3,1)`, ~900ms enters, 140ms stagger. The 60s timer ring animates linearly. Everything honours `prefers-reduced-motion`.
- **Copy:** Headlines 3–6 words with a period ("Be here." "Back to it." "Noticed.").
- **Accessibility:** 2px accent focus ring, 3px offset; `:active` tap states; WCAG AA contrast.
- **Reuse:** Keep existing components (e.g. BoxBreathing timer) and restyle them; build the 60s practice timer by extending the existing timer pattern from the Component Library rather than new.

## 8. Success metrics (personal)

- Observation sessions ≥ 15/week by week 3.
- Distraction resets "started on time" ≥ 70%.
- Present streak ≥ 7 days within the first month.
- Judgments caught rising in weeks 1–2 (awareness), then flattening.

## 9. Risks

| Risk | Mitigation |
|---|---|
| iOS background notifications unreliable | "Set phone alarm" fallback; test on device in Sprint 2 |
| Redesign scope creeps | Redesign in its own sprint; tokens first, then screen by screen |
| Practices feel like chores | Short copy, no guilt messaging, streaks forgive one missed day *(decision for review)* |
| Sensitive data | Local only; no analytics; optional app lock (existing pattern if present) |

## 10. Release plan (sprints — detail in sprint plan)

1. **Sprint 1 — Tokens + redesign:** `:root` tokens, type, hairlines; restyle all existing screens.
2. **Sprint 2 — Present core:** Object/food observation, body focus, 60s timer, reminders, Dexie tables.
3. **Sprint 3 — Distraction reset + judgment + reframe:** "Back to it", PWA shortcut, logs, reframe journal.
4. **Sprint 4 — Dashboard + chart integration, QA, deploy, README.**

**Definition of Done (each sprint):** builds clean; works offline as a PWA; mobile at 16px gutter; only allowed font sizes; reduced-motion respected; no console errors; pushed to GitHub; Netlify deploy green; Change Log row added.

## 11. Open questions

1. Light or dark variant? (Drafted as light.)
2. Accent hue — sage/teal OK, or reuse Serenity's current brand colour?
3. Food unlock at 14 object sessions, or manual only?
4. Should streaks forgive one missed day?
