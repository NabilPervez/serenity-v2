// ======================================================
// AS NEEDED — HIGH-STRESS SITUATIONAL INTERVENTIONS
// ======================================================

export interface EmergencyTool {
  id: string;
  title: string;
  subtitle: string;
  icon: string; // Material Symbols name
  steps: string[];
  why: string;
}

export const EMERGENCY_TOOLS: EmergencyTool[] = [
  {
    id: 'panic_walk',
    title: 'The Panic Attack Walk',
    subtitle: 'Burning the energy',
    icon: 'directions_walk',
    steps: [
      'Notice the signs: racing heart, shortness of breath.',
      'Get moving immediately — walk quickly around the block, or up and down stairs.',
      'Keep going for 5–10 minutes, letting your breath find its own rhythm as you move.',
    ],
    why: 'Movement tricks the brain into thinking you\u2019ve successfully "fled" the imaginary danger, which stops the adrenaline dump.',
  },
  {
    id: 'boundary_formula',
    title: 'The Assertive Boundary Formula',
    subtitle: 'When manipulated or guilt-tripped',
    icon: 'forum',
    steps: [
      'State the feeling — "I feel hurt when you complain to others about me."',
      'State the boundary — "I am doing all I can to help."',
      'Redirect — "Anyway, what time is dinner?" Do not argue or negotiate further.',
    ],
    why: 'A short, structured formula keeps you out of the emotional tug-of-war without escalating conflict.',
  },
  {
    id: 'lower_body_temp',
    title: 'Lower Body Temp (Emergency Reset)',
    subtitle: 'Up to 2 hours of calm',
    icon: 'ac_unit',
    steps: [
      'Dunk your face into ice water for 8 seconds.',
      'Pull out and breathe for 5–8 seconds.',
      'Repeat the dunk-and-breathe cycle 2–3 times.',
    ],
    why: 'The mammalian dive response pulls blood to your core and releases serotonin — a fast, physiological reset when a panic attack is escalating.',
  },
];
