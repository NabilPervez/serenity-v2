import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  /** Up to 7 affirmation IDs chosen for the morning mirror routine. */
  favoriteAffirmationIds: string[];
  /** Up to 5 coping skill IDs chosen to practice daily. */
  favoriteCopingSkillIds: string[];
  currentStreak: number;
  lastOpenedDate: string; // YYYY-MM-DD

  toggleFavoriteAffirmation: (id: string) => void;
  toggleFavoriteCopingSkill: (id: string) => void;
  updateStreak: () => void;
}

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      favoriteAffirmationIds: ['aff_05', 'aff_07', 'aff_18', 'aff_23', 'aff_60', 'aff_78', 'aff_87'],
      favoriteCopingSkillIds: ['exercise', 'box_breathing', 'journal', 'humor', 'spirituality'],
      currentStreak: 0,
      lastOpenedDate: '',

      toggleFavoriteAffirmation: (id) => {
        const { favoriteAffirmationIds } = get();
        const has = favoriteAffirmationIds.includes(id);
        if (!has && favoriteAffirmationIds.length >= 7) return; // cap at 7
        set({
          favoriteAffirmationIds: has
            ? favoriteAffirmationIds.filter((a) => a !== id)
            : [...favoriteAffirmationIds, id],
        });
      },

      toggleFavoriteCopingSkill: (id) => {
        const { favoriteCopingSkillIds } = get();
        const has = favoriteCopingSkillIds.includes(id);
        if (!has && favoriteCopingSkillIds.length >= 5) return; // cap at 5
        set({
          favoriteCopingSkillIds: has
            ? favoriteCopingSkillIds.filter((s) => s !== id)
            : [...favoriteCopingSkillIds, id],
        });
      },

      updateStreak: () => {
        const today = getTodayDateString();
        const { lastOpenedDate, currentStreak } = get();
        if (lastOpenedDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const y = yesterday.getFullYear();
        const m = String(yesterday.getMonth() + 1).padStart(2, '0');
        const d = String(yesterday.getDate()).padStart(2, '0');
        const yesterdayStr = `${y}-${m}-${d}`;

        const newStreak = lastOpenedDate === yesterdayStr ? currentStreak + 1 : 1;
        set({ currentStreak: newStreak, lastOpenedDate: today });
      },
    }),
    { name: 'serenity-v2-preferences' }
  )
);

export { getTodayDateString };
