/**
 * Story pages content.
 * English lines are meaning-based renderings, not word-for-word translations.
 * VERIFY each item against a trusted source (e.g. quran.com, sunnah.com) before relying on it.
 */

export interface MercyVerse {
  id: string;
  text: string;
  ref: string;
}

export const MERCY_VERSES: MercyVerse[] = [
  { id: 'zumar_53', text: 'Say: O My servants who have wronged themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins.', ref: 'Quran 39:53' },
  { id: 'baqarah_286', text: 'Allah does not burden a soul beyond what it can bear.', ref: 'Quran 2:286' },
  { id: 'sharh_5_6', text: 'For indeed, with hardship comes ease. Indeed, with hardship comes ease.', ref: 'Quran 94:5–6' },
  { id: 'araf_156', text: 'My mercy encompasses all things.', ref: 'Quran 7:156' },
  { id: 'talaq_3', text: 'Whoever relies upon Allah — He is sufficient for him.', ref: 'Quran 65:3' },
  { id: 'imran_159', text: 'Once you have decided, put your trust in Allah. Indeed, Allah loves those who rely upon Him.', ref: 'Quran 3:159' },
];

export interface Dua {
  id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  ref: string;
}

export const DUAS: Dua[] = [
  {
    id: 'hasbunallah',
    arabic: 'حَسْبُنَا ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ',
    transliteration: "Hasbunallahu wa ni'mal wakeel",
    meaning: 'Allah is sufficient for us, and He is the best disposer of affairs.',
    ref: 'Quran 3:173',
  },
  {
    id: 'hamm_hazan',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ',
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan",
    meaning: 'O Allah, I seek refuge in You from anxiety and sorrow.',
    ref: 'Sahih al-Bukhari',
  },
];

/** Stable pick by a seed string (e.g. today's date) so the item doesn't flicker. */
export function pickBySeed<T>(items: T[], seed: string): T {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return items[h % items.length];
}

/** ISO week start (Monday), local time, YYYY-MM-DD. */
export function getWeekStart(d = new Date()): string {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}
