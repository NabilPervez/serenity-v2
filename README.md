# Serenity v2 — Daily Action Plan for Anxiety & Stress

A local-first PWA guiding you through a structured, three-part daily action
plan for anxiety and stress management, built on the physiological "reset →
maintain → wind down" model from the Daily Action Plan for Anxiety & Stress
Reduction.

Built on top of `NabilPervez/serenity`'s design system and data layer, and
following the Serenity v2 PRD sprint-by-sprint.

## Getting started

```bash
npm install
npm run dev       # local dev server
npm run build     # production build (tsc -b && vite build)
npm run preview   # preview the production build
```

## Stack

- React 19 + TypeScript + Vite
- React Router (client-side routing: `/checklist`, `/tools`, `/analytics`)
- Zustand + `persist` (favorite affirmations / coping skills, streak)
- Dexie (IndexedDB) for offline-first daily checklist + check-in history
- `vite-plugin-pwa` (auto-registers a service worker, offline app shell)
- Recharts (7-day adherence vs. stress trend)
- Framer Motion (page transitions)

## How this maps to the PRD sprints

**Sprint 1 — PWA Foundation & State Architecture**
`vite-plugin-pwa` registers the service worker (`registerType: 'autoUpdate'`)
and precaches the app shell for full offline load. `AppShell.tsx` renders the
responsive nav (desktop sidebar / mobile bottom nav) routing between
`/checklist`, `/tools`, and `/analytics`. Zustand (`useAppStore`) and Dexie
(`db.ts`) initialize with sane blank/default state on first run.

**Sprint 2 — The Three-Phase Daily Checklist**
`ChecklistPage.tsx` renders Morning / Afternoon / Evening sections sourced
from `data/checklist.ts` (the exact 5/6/5 tasks from the plan). Toggling a
task updates state instantly and persists to `checklistDays` in Dexie,
keyed by date — no page refresh needed.

**Sprint 3 — Interactive Tools & Situational Interventions**
`ToolsPage.tsx` renders a module grid (Box Breathing, Emotional Check-in,
Affirmations & Coping). `BoxBreathing.tsx` runs the 4s inhale / 4s hold / 5s
exhale / rest cycle for 10 reps. `EmotionalCheckIn.tsx` captures mood +
anxiety level (1–10) + notes, timestamped into Dexie's `checkIns` table. The
"Emergency Reset" section renders the Panic Attack Walk, Assertive Boundary
Formula, and Lower Body Temp reset as expandable cards. The Affirmations &
Coping modal loads all 101 affirmations and 26 coping skills for selection
(favorites capped at 7 / 5 respectively, per the plan).

**Sprint 4 — Analytics Timeline & Data Visualization**
`AnalyticsPage.tsx` reads all historical `checkIns` and `checklistDays` from
Dexie, renders a chronological timeline (mood, stress level, notes, and that
day's completion %), and a Recharts `ComposedChart` plotting checklist
adherence (bar) against average stress level (line) over a 7-day rolling
window. The chart container scrolls horizontally on narrow viewports.

## Data source

`src/data/checklist.ts` and `src/data/emergencyTools.ts` are transcribed
directly from the Daily Action Plan document. `src/data/affirmations.json`
and `src/data/copingSkills.json` carry over verbatim from the original
Serenity app (101 affirmations, 26 coping skills — counts verified).

## Verified

- `npx tsc -b` — clean
- `npx eslint .` — clean
- `npx vite build` — succeeds, service worker + manifest generated
# serenity-v2
# serenity-v2
