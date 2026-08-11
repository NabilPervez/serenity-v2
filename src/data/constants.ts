// ======================================================
// DATA CONSTANTS
// Source data loaded from JSON files:
//   src/data/copingSkills.json  — 26 coping skills
//   src/data/affirmations.json  — 101 positive affirmations
// ======================================================

import copingSkillsData from './copingSkills.json';
import affirmationsData from './affirmations.json';

// ── Types ──────────────────────────────────────────────

export interface CopingSkill {
  id: string;
  name: string;
  description: string;   // short display text
  fullText: string;      // original verbatim text from source
  icon: string;           // Material Symbols icon name
  category: string;       // physical | creative | relaxation | mental | spiritual | social
}

export interface Affirmation {
  id: string;
  text: string;           // verbatim from source
}

// ── Exported data ─────────────────────────────────────

export const COPING_SKILLS: CopingSkill[] = copingSkillsData as CopingSkill[];

export const AFFIRMATIONS: Affirmation[] = affirmationsData as Affirmation[];

// ── Mood tags for emotional check-ins ─────────────────

export interface MoodOption {
  label: string;
  icon: string;
  /** Approximate anxiety weight, 1 (calmest) – 10 (most activated). Used as a slider default. */
  defaultAnxietyLevel: number;
}

export const MOODS: MoodOption[] = [
  { label: 'Calm', icon: '\ud83d\ude0c', defaultAnxietyLevel: 2 },
  { label: 'Grateful', icon: '\ud83d\ude4f', defaultAnxietyLevel: 2 },
  { label: 'Hopeful', icon: '\ud83c\udf31', defaultAnxietyLevel: 3 },
  { label: 'Tired', icon: '\ud83d\ude34', defaultAnxietyLevel: 4 },
  { label: 'Restless', icon: '\ud83d\ude24', defaultAnxietyLevel: 6 },
  { label: 'Anxious', icon: '\ud83d\ude30', defaultAnxietyLevel: 7 },
  { label: 'Overwhelmed', icon: '\ud83d\ude35', defaultAnxietyLevel: 9 },
  { label: 'Sad', icon: '\ud83d\ude14', defaultAnxietyLevel: 6 },
];
