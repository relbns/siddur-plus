// === Core Types for Siddur+ ===

// --- Predicate Logic DSL ---
export type Predicate =
  | string
  | { and: Predicate[] }
  | { or: Predicate[] }
  | { not: Predicate };

// --- Content Nodes ---
export interface ContentNode {
  id: string;
  type: 'text' | 'heading' | 'instruction' | 'group';
  contentHe: string;
  contentHeClean: string;
  children?: ContentNode[];
  renderCondition?: Predicate;
}

// --- Prayer Documents ---
export interface PrayerSection {
  id: string;
  title: string;
  nodes: ContentNode[];
}

export interface PrayerDocument {
  id: string;
  title: string;
  category: 'daily' | 'shabbat' | 'holiday' | 'special';
  nusach: 'ashkenaz' | 'sefard' | 'edot-hamizrach' | 'shared';
  sections: PrayerSection[];
}

// --- Tehillim ---
export interface TehillimChapter {
  number: number;
  book: 1 | 2 | 3 | 4 | 5;
  contentHe: string;
  contentHeClean: string;
  verseCount: number;
}

export interface TehillimBook {
  chapters: TehillimChapter[];
}

export interface ReadingPlan {
  id: string;
  label: string;
  mapping: Record<number, number[]>;
}

// --- Halacha ---
export interface RelevanceRule {
  flag: string;
  value: boolean | string | number;
  priority: 1 | 2 | 3;
  daysBeforeHoliday?: number;
}

export interface HalachaEntry {
  id: string;
  title: string;
  summary: string;
  contentHe: string;
  category: 'daily' | 'holiday' | 'topic';
  tags: string[];
  relevance: RelevanceRule[];
}

export interface ZmanimSet {
  alotHashachar: Date;
  misheyakir: Date;
  sunrise: Date;
  sofZmanShmaMGA: Date;
  sofZmanShma: Date;
  sofZmanTfillaMGA: Date;
  sofZmanTfilla: Date;
  chatzot: Date;
  minchaGedola: Date;
  minchaKetana: Date;
  plagHamincha: Date;
  sunset: Date;
  tzeitHakochavim: Date;
  chatzotNight: Date;
}

// --- App Context ---
export interface AppContext {
  effectiveDate: Date;
  hebrewDate: string;
  dayOfWeek: number;
  parasha: string | null;
  holidayName: string | null;

  zmanim: ZmanimSet | null;
  currentTimeSlot: 'morning' | 'afternoon' | 'evening' | 'night';

  isShabbat: boolean;
  isErevShabbat: boolean;
  isYomTov: boolean;
  isErevYomTov: boolean;
  isCholHamoed: boolean;
  isRoshChodesh: boolean;
  isChanukah: boolean;
  isPurim: boolean;
  isFastDay: boolean;
  isPesach: boolean;
  isSukkot: boolean;
  isShavuot: boolean;
  isRoshHashana: boolean;
  isYomKippur: boolean;

  tachanunAllowed: boolean;
  tefillinAllowed: boolean;
  hallelType: 'none' | 'half' | 'full';
  yaalehVeyavo: boolean;
  alHanisim: 'none' | 'chanukah' | 'purim';
  sefiraDay: number | null;
  sefiraDayHe: string | null;
  moridHatal: boolean;
  barechAleinu: boolean;
  candleLighting: Date | null;
  havdalah: Date | null;

  flags: string[];

  nusach: string;
  region: 'israel' | 'diaspora';
}

// --- User Settings ---
export interface UserSettings {
  nusach: 'ashkenaz' | 'sefard' | 'edot-hamizrach';
  region: 'israel' | 'diaspora';
  fontScale: number;
  showNikud: boolean;
  theme: 'light' | 'dark' | 'auto';
  keepScreenAwake: boolean;
  silentModeReminder: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  nusach: 'sefard',
  region: 'israel',
  fontScale: 1,
  showNikud: true,
  theme: 'auto',
  keepScreenAwake: true,
  silentModeReminder: true,
};
