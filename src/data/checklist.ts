// ======================================================
// DAILY ACTION PLAN — CHECKLIST DATA
// Sourced from: "Comprehensive Daily Action Plan for
// Anxiety & Stress Management" — Morning (Reset),
// Afternoon (Maintenance), and Evening (Wind Down) phases.
// ======================================================

export type Phase = 'morning' | 'afternoon' | 'evening';

export interface ChecklistTask {
  id: string;
  phase: Phase;
  title: string;
  frequency: string;
  whatToDo: string;
  whyWeDoIt: string;
  icon: string; // Material Symbols name
  /** If set, an "Open tool" affordance links to this in-app route */
  toolLink?: string;
}

export const PHASE_META: Record<Phase, { label: string; subtitle: string; icon: string }> = {
  morning: { label: 'Morning', subtitle: 'The "Reset" Phase', icon: 'wb_twilight' },
  afternoon: { label: 'Afternoon', subtitle: 'The "Maintenance" Phase', icon: 'wb_sunny' },
  evening: { label: 'Evening', subtitle: 'The "Wind Down" Phase', icon: 'bedtime' },
};

export const CHECKLIST_TASKS: ChecklistTask[] = [
  // ── Morning ──────────────────────────────────────────
  {
    id: 'm_cold_plunge',
    phase: 'morning',
    title: 'Lower Body Temp (Cold Plunge)',
    frequency: 'Once daily, upon waking',
    whatToDo: 'Take a cold shower, drink cold water, or submerge your face in ice water for 8 seconds, breathe for 5–8 seconds, then submerge again.',
    whyWeDoIt: 'Cold water tricks your brain into the mammalian dive response — it pulls blood to your heart and brain and dumps serotonin, resetting your nervous system for up to 2 hours of calm.',
    icon: 'ac_unit',
  },
  {
    id: 'm_caffeine',
    phase: 'morning',
    title: 'Caffeine Elimination',
    frequency: 'Daily',
    whatToDo: 'Skip your usual morning coffee. If you need a boost, use a B12 pouch or limit yourself to 3oz of coffee.',
    whyWeDoIt: 'Caffeine chemically mimics anxiety — it raises heart rate and cortisol. With your stress bucket already full, it guarantees you\u2019ll breach your anxiety threshold.',
    icon: 'no_drinks',
  },
  {
    id: 'm_affirmations',
    phase: 'morning',
    title: 'Positive Affirmations',
    frequency: 'Once daily, in the morning',
    whatToDo: 'Stand in front of a mirror, look yourself in the eye, and say your 7 chosen affirmations out loud.',
    whyWeDoIt: 'Your subconscious controls 90% of your brain\u2019s function and always listens to your internal dialogue. Speaking these truths overwrites the fear-based narrative.',
    icon: 'record_voice_over',
    toolLink: '/tools?open=affirmations',
  },
  {
    id: 'm_exercise',
    phase: 'morning',
    title: 'Physical Exercise',
    frequency: 'Exactly 2 times a week',
    whatToDo: '30 minutes of weight lifting followed by 15 minutes of cardio.',
    whyWeDoIt: 'Lifting releases endorphins; cardio past 20 minutes forces a massive release of serotonin.',
    icon: 'fitness_center',
  },
  {
    id: 'm_box_breathing',
    phase: 'morning',
    title: 'Box Breathing',
    frequency: '2–3x a day (morning included)',
    whatToDo: 'Inhale through the stomach for 4s, hold 4s, exhale 5–6s. Repeat 10 times.',
    whyWeDoIt: 'Breathing into your stomach pushes the diaphragm up, telling your brain you\u2019re safe and triggering a natural serotonin release.',
    icon: 'air',
    toolLink: '/tools?open=breathe',
  },

  // ── Afternoon ────────────────────────────────────────
  {
    id: 'a_box_breathing',
    phase: 'afternoon',
    title: 'Box Breathing',
    frequency: 'Daily check-in',
    whatToDo: 'Repeat the 4-4-6 box breathing cycle 10 times. Stomach out on the inhale.',
    whyWeDoIt: 'A midday reset keeps your nervous system from re-accumulating stress before evening.',
    icon: 'air',
    toolLink: '/tools?open=breathe',
  },
  {
    id: 'a_laughter',
    phase: 'afternoon',
    title: 'Intentional Laughter',
    frequency: '5–10 minutes',
    whatToDo: 'Actively seek out something funny — a stand-up clip or a funny video.',
    whyWeDoIt: 'Humor and anxiety biologically cannot co-exist in the brain.',
    icon: 'sentiment_very_satisfied',
  },
  {
    id: 'a_try_fail',
    phase: 'afternoon',
    title: 'Try Something New and Fail',
    frequency: 'Daily',
    whatToDo: 'Try leg day, drawing, or coloring — anything unfamiliar.',
    whyWeDoIt: 'Failing and practicing being okay with it builds resilience against perfectionism.',
    icon: 'emoji_objects',
  },
  {
    id: 'a_support',
    phase: 'afternoon',
    title: 'Expand Your Support System',
    frequency: 'Daily',
    whatToDo: 'Try to make a new connection today. Just say hi to someone.',
    whyWeDoIt: 'Connection combats isolation and stress.',
    icon: 'group_add',
  },
  {
    id: 'a_smile',
    phase: 'afternoon',
    title: 'Intentionally Smile',
    frequency: 'Daily',
    whatToDo: 'Force yourself to smile, even if it doesn\u2019t feel natural at first.',
    whyWeDoIt: 'The physical act of smiling triggers positive neural pathways, even when forced.',
    icon: 'sentiment_satisfied',
  },
  {
    id: 'a_bypass_codes',
    phase: 'afternoon',
    title: 'Use Bypass Codes',
    frequency: 'As intrusive thoughts arise',
    whatToDo: '"I know I messed up, but I\u2019m learning." / "I can\u2019t be afraid of something that hasn\u2019t happened yet. When it does, I\u2019ll figure it out just like before."',
    whyWeDoIt: 'Logical reframing interrupts the spiral before it takes hold.',
    icon: 'psychology',
  },

  // ── Evening ──────────────────────────────────────────
  {
    id: 'e_box_breathing',
    phase: 'evening',
    title: 'Box Breathing',
    frequency: 'Before bed',
    whatToDo: 'Repeat the 4-4-6 box breathing cycle 10 times to prep the body for sleep.',
    whyWeDoIt: 'Slows respiration and signals safety before your subconscious enters deep REM sleep.',
    icon: 'air',
    toolLink: '/tools?open=breathe',
  },
  {
    id: 'e_reclaim_identity',
    phase: 'evening',
    title: 'Reclaiming Your Identity',
    frequency: '15–30 minutes',
    whatToDo: 'Do something for pure enjoyment. Before starting, say out loud: "I give myself permission to do nothing right now without feeling guilty."',
    whyWeDoIt: 'Guilt-free hobby time restores a sense of self outside of obligation.',
    icon: 'palette',
  },
  {
    id: 'e_sleep_hygiene',
    phase: 'evening',
    title: 'Strict Sleep Hygiene',
    frequency: 'Every night',
    whatToDo: 'No screens 1–2 hours before bed. Warm bath or shower. Play sleep music or read. In bed, repeat: "You are safe," and "Create the environment where you are safe."',
    whyWeDoIt: 'A hyper-vigilant subconscious needs consistent, repeated cues of safety to allow deep sleep.',
    icon: 'bedtime',
  },
  {
    id: 'e_dark_chocolate',
    phase: 'evening',
    title: 'Eat Dark Chocolate',
    frequency: 'A small piece before bed',
    whatToDo: 'Eat a small piece of 80% cocoa dark chocolate.',
    whyWeDoIt: 'Dark chocolate helps lower cortisol and supports serotonin production.',
    icon: 'cookie',
  },
  {
    id: 'e_gratitude',
    phase: 'evening',
    title: 'Daily Gratitude Journal',
    frequency: 'Every night',
    whatToDo: 'Write down a few things you\u2019re thankful for from today.',
    whyWeDoIt: 'Gratitude practice shifts focus away from threat-scanning and toward what\u2019s working.',
    icon: 'edit_note',
  },
];

export const TASKS_BY_PHASE: Record<Phase, ChecklistTask[]> = {
  morning: CHECKLIST_TASKS.filter((t) => t.phase === 'morning'),
  afternoon: CHECKLIST_TASKS.filter((t) => t.phase === 'afternoon'),
  evening: CHECKLIST_TASKS.filter((t) => t.phase === 'evening'),
};
