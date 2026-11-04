/** Local YYYY-MM-DD. */
export function today(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Consecutive days (ending today or yesterday) that contain at least one date. */
export function streak(dates: string[]): number {
  const set = new Set(dates);
  const d = new Date();
  if (!set.has(today(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(today(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export const FOOD_UNLOCK = 14; // estimate from PRD §5.1 — tune after a few weeks

export const BODY_PARTS = ['Hands', 'Feet', 'Shoulders', 'Jaw', 'Chest', 'Stomach', 'Back'];
export const OBSERVE_PROMPTS = ['Colour.', 'Shape.', 'Texture.', 'Weight.', 'Light.', 'Edges.', 'Temperature.'];
export const FOOD_PROMPTS = ['Colour.', 'Smell.', 'Texture.', 'Temperature.', 'Sound when you bite.', 'Taste, as facts.'];
export const BODY_PROMPTS = ['Warm or cool?', 'Tight or loose?', 'Still or moving?', 'Heavy or light?', 'Pressure? Tingling?'];
export const JUDGMENT_TAGS = ['Self', 'Food/Cooking', 'Work', 'Others', 'Other'];

/** Soft chime via Web Audio — no asset needed. */
export function chime(freq = 528) {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 1.7);
    o.onended = () => ctx.close();
  } catch {
    /* audio unavailable */
  }
  try { navigator.vibrate?.(60); } catch { /* no haptics */ }
}

/** Wall-clock ms (kept out of components so render stays pure). */
export const nowMs = () => Date.now();
