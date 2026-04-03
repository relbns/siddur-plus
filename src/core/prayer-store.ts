import { create } from 'zustand';

export interface SidebarSection {
  id: string;
  title: string;
}

export interface SidebarPrayer {
  id: string;
  title: string;
  category?: string;
  sections: SidebarSection[];
}

/** Sidebar-aware prayer sections store.
 *  Updated by PrayerReader when a prayer is loaded.
 *  Used by Sidebar to render accordion with direct-section links.
 */
interface PrayerStoreState {
  currentPrayerId: string | null;
  currentPrayerTitle: string | null;
  currentSections: SidebarSection[];
  setPrayerSections: (prayerId: string, prayerTitle: string, sections: SidebarSection[]) => void;
  clearPrayerSections: () => void;
}

export const usePrayerStore = create<PrayerStoreState>()((set) => ({
  currentPrayerId: null,
  currentPrayerTitle: null,
  currentSections: [],
  setPrayerSections: (prayerId, prayerTitle, sections) =>
    set({ currentPrayerId: prayerId, currentPrayerTitle: prayerTitle, currentSections: sections }),
  clearPrayerSections: () =>
    set({ currentPrayerId: null, currentPrayerTitle: null, currentSections: [] }),
}));

/** Static section definitions per prayer — used by Sidebar when not inside a prayer */
export const PRAYER_CATALOG: SidebarPrayer[] = [
  {
    id: 'shacharit',
    title: 'שחרית',
    category: 'תפילות',
    sections: [
      { id: 'morning-blessings', title: 'ברכות השחר' },
      { id: 'torah-blessings', title: 'ברכות התורה' },
      { id: 'morning-prayer', title: 'פסוקי דזימרה' },
      { id: 'korbanot', title: 'קורבנות' },
      { id: 'hodu', title: 'הודו' },
      { id: 'yishtabach', title: 'ישתבח' },
      { id: 'shema', title: 'קריאת שמע' },
      { id: 'amidah', title: 'עמידה' },
      { id: 'tachanun', title: 'תחנון' },
      { id: 'ashrei', title: 'אשרי' },
      { id: 'aleinu', title: 'עלינו לשבח' },
      { id: 'song-of-day', title: 'שיר של יום' },
    ],
  },
  {
    id: 'mincha',
    title: 'מנחה',
    category: 'תפילות',
    sections: [
      { id: 'korbanot', title: 'קורבנות' },
      { id: 'amidah', title: 'עמידה' },
      { id: 'tachanun', title: 'תחנון' },
    ],
  },
  {
    id: 'maariv',
    title: 'ערבית',
    category: 'תפילות',
    sections: [
      { id: 'shema', title: 'קריאת שמע' },
      { id: 'amidah', title: 'עמידה' },
    ],
  },
  {
    id: 'bedtime-shema',
    title: 'קריאת שמע על המיטה',
    category: 'תפילות',
    sections: [],
  },
  {
    id: 'birkat-hamazon',
    title: 'ברכת המזון',
    category: 'ברכות',
    sections: [],
  },
  {
    id: 'mein-shalosh',
    title: 'מעין שלוש',
    category: 'ברכות',
    sections: [],
  },
  {
    id: 'asher-yatzar',
    title: 'אשר יצר',
    category: 'ברכות',
    sections: [],
  },
  {
    id: 'kiddush',
    title: 'ספר קידושים',
    category: 'מיוחדות',
    sections: [
      { id: 'leil-shabbat', title: 'ליל שבת' },
      { id: 'yom-shabbat', title: 'יום שבת' },
      { id: 'leil-yomtov', title: 'ליל יום טוב' },
      { id: 'rosh-hashana', title: 'ראש השנה' },
    ],
  },
  {
    id: 'parashat-haman',
    title: 'פרשת המן',
    category: 'מיוחדות',
    sections: [],
  },
  {
    id: 'tefilat-hashlah',
    title: 'תפילת השל״ה',
    category: 'מיוחדות',
    sections: [],
  },
];

