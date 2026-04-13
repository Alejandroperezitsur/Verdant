import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Habit, UserIdentity, AppSettings } from '@/types/habit';

const DB_NAME = 'verdant-db';
const DB_VERSION = 2;

interface VerdantDB extends DBSchema {
  habits: {
    key: string;
    value: Habit;
  };
  userIdentity: {
    key: 'identity';
    value: UserIdentity;
  };
  settings: {
    key: 'settings';
    value: AppSettings;
  };
  metadata: {
    key: string;
    value: { key: string; value: unknown };
  };
}

let db: IDBPDatabase<VerdantDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<VerdantDB>> {
  if (db) return db;
  
  db = await openDB<VerdantDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('habits')) {
        db.createObjectStore('habits', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('userIdentity')) {
        db.createObjectStore('userIdentity');
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    },
  });
  
  return db;
}

// Habit operations
export async function getAllHabits(): Promise<Habit[]> {
  const database = await initDB();
  return database.getAll('habits');
}

export async function getHabit(id: string): Promise<Habit | undefined> {
  const database = await initDB();
  return database.get('habits', id);
}

export async function saveHabit(habit: Habit): Promise<void> {
  const database = await initDB();
  await database.put('habits', habit);
}

export async function deleteHabit(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('habits', id);
}

// User identity operations
export async function getUserIdentity(): Promise<UserIdentity | undefined> {
  const database = await initDB();
  return database.get('userIdentity', 'identity');
}

export async function saveUserIdentity(identity: UserIdentity): Promise<void> {
  const database = await initDB();
  await database.put('userIdentity', identity, 'identity');
}

// Settings operations
export async function getSettings(): Promise<AppSettings | undefined> {
  const database = await initDB();
  return database.get('settings', 'settings');
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const database = await initDB();
  await database.put('settings', settings, 'settings');
}

// Metadata operations
export async function getMetadata(key: string): Promise<unknown> {
  const database = await initDB();
  const result = await database.get('metadata', key);
  return result?.value;
}

export async function setMetadata(key: string, value: unknown): Promise<void> {
  const database = await initDB();
  await database.put('metadata', { key, value });
}

// Migration from localStorage (one-time)
export async function migrateFromLocalStorage(): Promise<void> {
  const migrated = await getMetadata('migrated-from-localstorage');
  if (migrated) return;
  
  try {
    const oldData = localStorage.getItem('verdant-habits-v1');
    if (oldData) {
      const habits: Habit[] = JSON.parse(oldData);
      const database = await initDB();
      const tx = database.transaction('habits', 'readwrite');
      for (const habit of habits) {
        if (!habit.streakCount) habit.streakCount = 0;
        if (!habit.streakBuffer) habit.streakBuffer = 1;
        if (!habit.consecutiveFailures) habit.consecutiveFailures = 0;
        if (!habit.riskLevel) habit.riskLevel = 'normal';
        if (!habit.preBreakStreak) habit.preBreakStreak = 0;
        await tx.store.put(habit);
      }
      await tx.done;
    }
    await setMetadata('migrated-from-localstorage', true);
  } catch (e) {
    console.error('Migration failed:', e);
  }
}

// Export for backup
export async function exportData(): Promise<{ 
  habits: Habit[]; 
  identity: UserIdentity | undefined;
  settings: AppSettings | undefined;
  exportedAt: string;
}> {
  const habits = await getAllHabits();
  const identity = await getUserIdentity();
  const settings = await getSettings();
  return { habits, identity, settings, exportedAt: new Date().toISOString() };
}

// Import from backup
export async function importData(data: { 
  habits: Habit[]; 
  identity?: UserIdentity;
  settings?: AppSettings;
}): Promise<void> {
  const database = await initDB();
  
  const habitTx = database.transaction('habits', 'readwrite');
  for (const habit of data.habits) {
    await habitTx.store.put(habit);
  }
  await habitTx.done;
  
  if (data.identity) {
    await saveUserIdentity(data.identity);
  }
  
  if (data.settings) {
    await saveSettings(data.settings);
  }
}

// Download export as file
export function downloadExport(data: object): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `verdant-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Read import file
export function readImportFile(file: File): Promise<{ habits: Habit[]; identity?: UserIdentity; settings?: AppSettings }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (err) {
        reject(new Error('Invalid backup file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
