import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface ChecklistState {
  items: ChecklistItem[];
  lastResetWeek: number; // ISO week number
  toggleItem: (id: string) => void;
  checkReset: () => void;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: 'plata', label: 'פלטת שבת', checked: false },
  { id: 'micham', label: 'מיחם מים', checked: false },
  { id: 'clocks', label: 'שעוני שבת (תאורה/מזגן)', checked: false },
  { id: 'toilet-paper', label: 'נייר טואלט חתוך', checked: false },
  { id: 'lights', label: 'כיבוי אורות מקרר', checked: false },
  { id: 'candles', label: 'הכנת נרות', checked: false },
  { id: 'phone-silent', label: 'השתקת טלפונים', checked: false },
];

function getISOWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

const localforageStorage = createJSONStorage<ChecklistState>(() => ({
  getItem: async (name: string) => {
    const val = await localforage.getItem<string>(name);
    return val ?? null;
  },
  setItem: async (name: string, value: string) => {
    await localforage.setItem(name, value);
  },
  removeItem: async (name: string) => {
    await localforage.removeItem(name);
  },
}));

export const useChecklistStore = create<ChecklistState>()(
  persist(
    (set, get) => ({
      items: DEFAULT_ITEMS,
      lastResetWeek: getISOWeek(new Date()),
      toggleItem: (id) => set((state) => ({
        items: state.items.map(item => 
          item.id === id ? { ...item, checked: !item.checked } : item
        )
      })),
      checkReset: () => {
        const now = new Date();
        const currentWeek = getISOWeek(now);
        const isFriday = now.getDay() === 5;
        
        if (isFriday && currentWeek !== get().lastResetWeek) {
          set({ items: DEFAULT_ITEMS, lastResetWeek: currentWeek });
        }
      }
    }),
    {
      name: 'siddur-checklist',
      storage: localforageStorage,
    }
  )
);
