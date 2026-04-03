import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import type { AppContext, UserSettings } from './types';
import { DEFAULT_SETTINGS } from './types';
import { buildContext } from './context-engine';

// === localforage-backed storage adapter for Zustand ===
const localforageStorage = createJSONStorage(() => ({
  getItem: async (name: string) => {
    const val = await localforage.getItem<string>(name);
    return val;
  },
  setItem: async (name: string, value: string) => {
    await localforage.setItem(name, value);
  },
  removeItem: async (name: string) => {
    await localforage.removeItem(name);
  },
}));

// === Settings Store ===
interface SettingsState extends UserSettings {
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      updateSetting: (key, value) => set({ [key]: value }),
    }),
    {
      name: 'siddur-settings',
      storage: localforageStorage,
    }
  )
);

// === Context Store ===
interface ContextState {
  context: AppContext | null;
  simulatedDate: Date | null;
  sessionLocked: boolean;
  lockedContext: AppContext | null;
  refreshContext: () => void;
  setSimulatedDate: (date: Date | null) => void;
  lockSession: () => void;
  unlockSession: () => void;
}

export const useContextStore = create<ContextState>()((set, get) => ({
  context: null,
  simulatedDate: null,
  sessionLocked: false,
  lockedContext: null,

  refreshContext: () => {
    const { simulatedDate } = get();
    const settings = useSettingsStore.getState();
    const date = simulatedDate ?? new Date();
    const ctx = buildContext(date, settings, settings.location || undefined);
    set({ context: ctx });
  },

  setSimulatedDate: (date) => {
    set({ simulatedDate: date });
    get().refreshContext();
  },

  lockSession: () => {
    const { context } = get();
    set({ sessionLocked: true, lockedContext: context });
  },

  unlockSession: () => {
    set({ sessionLocked: false, lockedContext: null });
    get().refreshContext();
  },
}));

// === Tehillim Store ===
interface TehillimState {
  favorites: number[];
  readChapters: number[];
  lastReadChapter: number | null;
  addFavorite: (chapter: number) => void;
  removeFavorite: (chapter: number) => void;
  setLastRead: (chapter: number) => void;
  markChapterRead: (chapter: number) => void;
  isRead: (chapter: number) => boolean;
}

export const useTehillimStore = create<TehillimState>()(
  persist(
    (set, get) => ({
      favorites: [],
      readChapters: [],
      lastReadChapter: null,
      addFavorite: (ch) =>
        set({ favorites: [...get().favorites.filter((f) => f !== ch), ch] }),
      removeFavorite: (ch) =>
        set({ favorites: get().favorites.filter((f) => f !== ch) }),
      setLastRead: (ch) => set({ lastReadChapter: ch }),
      markChapterRead: (ch) => {
        const { readChapters } = get();
        if (!readChapters.includes(ch)) {
          set({ readChapters: [...readChapters, ch], lastReadChapter: ch });
        } else {
          set({ lastReadChapter: ch });
        }
      },
      isRead: (ch) => get().readChapters.includes(ch),
    }),
    {
      name: 'siddur-tehillim',
      storage: localforageStorage,
    }
  )
);
