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

class SerenityDB extends Dexie {
  checklistDays!: Table<ChecklistDay>;
  checkIns!: Table<CheckIn>;

  constructor() {
    super('SerenityV2DB');
    this.version(1).stores({
      checklistDays: '++id, date',
      checkIns: '++id, timestamp, date',
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
