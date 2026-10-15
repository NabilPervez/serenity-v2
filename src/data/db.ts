import Dexie, { type Table } from 'dexie';

/** One row per calendar day, tracking which checklist task IDs are checked. */
export interface ChecklistDay {
  id?: number;
  date: string; // YYYY-MM-DD
  completedTaskIds: string[];
}

/** A single timestamped emotional check-in. */
export interface CheckIn {
  id?: number;
  timestamp: number;
  date: string; // YYYY-MM-DD, local
  mood: string;
  moodIcon: string;
  anxietyLevel: number; // 1–10
  notes: string;
}

/** Story › Reframe: one harsh thought rewritten into a merciful one. */
export interface Reframe {
  id?: number;
  timestamp: number;
  date: string;
  oldStory: string;
  intensityBefore: number;
  myPartTags: string[];
  myPart: string;
  allahsPart: string;
  newStory: string;
  intensityAfter: number;
  verseId: string;
}

/** Story › Effort Ledger: one row per night. */
export interface EffortNight {
  id?: number;
  date: string;
  entries: string[];
  handedOver: string;
  duaId: string;
  createdAt: number;
}

/** Story › Four Pillars: one row per ISO week (Monday). */
export interface PillarWeek {
  id?: number;
  weekStart: string;
  community: string;
  purpose: string;
  charity: string;
  headline: string;
  createdAt: number;
}

class SerenityDB extends Dexie {
  checklistDays!: Table<ChecklistDay>;
  checkIns!: Table<CheckIn>;
  reframes!: Table<Reframe>;
  efforts!: Table<EffortNight>;
  pillarWeeks!: Table<PillarWeek>;

  constructor() {
    super('SerenityV2DB');
    this.version(1).stores({
      checklistDays: '++id, date',
      checkIns: '++id, timestamp, date',
    });
    // v2 — additive: Story pages. v1 tables untouched.
    this.version(2).stores({
      checklistDays: '++id, date',
      checkIns: '++id, timestamp, date',
      reframes: '++id, timestamp, date',
      efforts: '++id, &date',
      pillarWeeks: '++id, &weekStart',
    });
  }
}

export const db = new SerenityDB();

// ── Helpers: Checklist ─────────────────────────────────

export async function getChecklistDay(date: string): Promise<ChecklistDay | undefined> {
  return db.checklistDays.where('date').equals(date).first();
}

export async function saveChecklistDay(
  state: Omit<ChecklistDay, 'id'>,
  existingId?: number
): Promise<number> {
  if (existingId) {
    await db.checklistDays.update(existingId, state);
    return existingId;
  }
  return db.checklistDays.add(state);
}

/** All checklist days, most recent first. */
export async function getAllChecklistDays(): Promise<ChecklistDay[]> {
  return db.checklistDays.orderBy('date').reverse().toArray();
}

// ── Helpers: Check-ins ──────────────────────────────────

export async function addCheckIn(entry: Omit<CheckIn, 'id'>): Promise<number> {
  return db.checkIns.add(entry);
}

export async function getRecentCheckIns(limit = 100): Promise<CheckIn[]> {
  return db.checkIns.orderBy('timestamp').reverse().limit(limit).toArray();
}

export async function getAllCheckIns(): Promise<CheckIn[]> {
  return db.checkIns.orderBy('timestamp').reverse().toArray();
}

// ── Helpers: Story ──────────────────────────────────────

export const addReframe = (r: Omit<Reframe, 'id'>) => db.reframes.add(r);
export const getAllReframes = () => db.reframes.orderBy('timestamp').reverse().toArray();

export const getEffortNight = (date: string) => db.efforts.where('date').equals(date).first();
export const getAllEffortNights = () => db.efforts.orderBy('date').reverse().toArray();
export async function saveEffortNight(n: Omit<EffortNight, 'id'>): Promise<void> {
  const existing = await getEffortNight(n.date);
  if (existing?.id) await db.efforts.update(existing.id, n);
  else await db.efforts.add(n);
}

export const getPillarWeek = (weekStart: string) => db.pillarWeeks.where('weekStart').equals(weekStart).first();
export const getAllPillarWeeks = () => db.pillarWeeks.orderBy('weekStart').reverse().toArray();
export async function savePillarWeek(w: Omit<PillarWeek, 'id'>): Promise<void> {
  const existing = await getPillarWeek(w.weekStart);
  if (existing?.id) await db.pillarWeeks.update(existing.id, w);
  else await db.pillarWeeks.add(w);
}
