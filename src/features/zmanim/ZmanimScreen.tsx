import { useMemo } from 'react';
import { HDate, HebrewCalendar } from '@hebcal/core';
import { StandardHeader } from '../../shared/Header';
import { useContextStore } from '../../core/stores';
import type { AppContext } from '../../core/types';
import './ZmanimScreen.css';

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const HEB_MONTHS: Record<string, string> = {
  Nisan: 'ניסן', Iyyar: 'אייר', Sivan: 'סיוון', Tamuz: 'תמוז', Av: 'אב',
  Elul: 'אלול', Tishrei: 'תשרי', Cheshvan: 'חשוון', Kislev: 'כסליו',
  Tevet: 'טבת', Shvat: 'שבט', Adar: 'אדר', 'Adar I': 'אדר א׳', 'Adar II': 'אדר ב׳',
};

interface ZmanEntry {
  label: string;
  time: Date | null | undefined;
  desc?: string;
  category: 'morning' | 'shacharit' | 'afternoon' | 'night' | 'shabbat';
}

const ZMAN_GROUPS: Array<{ title: string; icon: string; category: ZmanEntry['category'] }> = [
  { title: 'זמני הבוקר', icon: '🌅', category: 'morning' },
  { title: 'זמני שחרית', icon: '☀️', category: 'shacharit' },
  { title: 'זמני אחרי הצהריים', icon: '🌤️', category: 'afternoon' },
  { title: 'זמני ערב', icon: '🌙', category: 'night' },
  { title: 'שבת ויום טוב', icon: '🕯️', category: 'shabbat' },
];

function formatTime(date: Date | null | undefined): string | null {
  if (!date) return null;
  return new Date(date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function isNextZman(date: Date | null | undefined, allTimes: (Date | null | undefined)[]): boolean {
  if (!date) return false;
  const now = Date.now();
  const t = new Date(date).getTime();
  if (t < now) return false;
  // Check if this is the closest future time
  const closestFuture = allTimes
    .filter((d) => d && new Date(d).getTime() > now)
    .map((d) => new Date(d!).getTime())
    .sort((a, b) => a - b)[0];
  return t === closestFuture;
}

export function ZmanimScreen() {
  const context = useContextStore((s: { context: AppContext | null }) => s.context);

  const { monthNameHe, events } = useMemo(() => {
    if (!context) return { monthNameHe: '', events: [] };
    const hd = new HDate(context.effectiveDate);
    const engMonth = hd.getMonthName();
    const monthNameHe = HEB_MONTHS[engMonth] || engMonth;
    const startOfMonth = new HDate(1, hd.getMonth(), hd.getFullYear());
    let lastDay = 29;
    try { new HDate(30, hd.getMonth(), hd.getFullYear()); lastDay = 30; } catch { /* 29 */ }
    const endOfMonth = new HDate(lastDay, hd.getMonth(), hd.getFullYear());
    const events = HebrewCalendar.calendar({
      start: startOfMonth.greg(), end: endOfMonth.greg(), il: true, sedrot: true, molad: true,
    });
    return { monthNameHe, events };
  }, [context?.effectiveDate]);

  const allTimes = useMemo(() => {
    if (!context?.zmanim) return [];
    const z = context.zmanim;
    return [z.alotHashachar, z.sunrise, z.sofZmanShmaMGA, z.sofZmanShma,
      z.sofZmanTfillaMGA, z.sofZmanTfilla, z.chatzot, z.minchaGedola,
      z.minchaKetana, z.plagHamincha, z.sunset, z.tzeitHakochavim];
  }, [context?.zmanim]);

  const zmanGroups = useMemo((): Record<ZmanEntry['category'], ZmanEntry[]> => {
    if (!context?.zmanim) return { morning: [], shacharit: [], afternoon: [], night: [], shabbat: [] };
    const z = context.zmanim;
    return {
      morning: [
        { label: 'עלות השחר', time: z.alotHashachar, desc: 'תחילת הלילה ההלכתי, 72 דקות לפני הנץ', category: 'morning' },
        { label: 'הנץ החמה', time: z.sunrise, desc: 'זריחת השמש, תחילת זמן שחרית', category: 'morning' },
      ],
      shacharit: [
        { label: 'סוף זמן ק״ש — מג״א', time: z.sofZmanShmaMGA, desc: 'שיטת המגן אברהם (3 שעות זמניות מעלות)', category: 'shacharit' },
        { label: 'סוף זמן ק״ש — גר״א', time: z.sofZmanShma, desc: 'שיטת הגר״א (3 שעות זמניות מהנץ)', category: 'shacharit' },
        { label: 'סוף זמן תפילה — מג״א', time: z.sofZmanTfillaMGA, desc: 'שיטת המגן אברהם (4 שעות מעלות)', category: 'shacharit' },
        { label: 'סוף זמן תפילה — גר״א', time: z.sofZmanTfilla, desc: 'שיטת הגר״א (4 שעות מהנץ)', category: 'shacharit' },
        { label: 'חצות היום', time: z.chatzot, desc: 'אמצע היום ההלכתי, סוף זמן ק״ש בדיעבד', category: 'shacharit' },
      ],
      afternoon: [
        { label: 'מנחה גדולה', time: z.minchaGedola, desc: 'תחילת זמן מנחה (30 דקות אחרי חצות)', category: 'afternoon' },
        { label: 'מנחה קטנה', time: z.minchaKetana, desc: 'זמן מנחה קטנה (9.5 שעות מהנץ)', category: 'afternoon' },
        { label: 'פלג המנחה', time: z.plagHamincha, desc: '1.25 שעות זמניות לפני השקיעה', category: 'afternoon' },
      ],
      night: [
        { label: 'שקיעת החמה', time: z.sunset, desc: 'שקיעת השמש — תחילת בין השמשות', category: 'night' },
        { label: 'צאת הכוכבים', time: z.tzeitHakochavim, desc: 'זמן ערבית, מוצאי שבת וסיום תעניות', category: 'night' },
        { label: 'חצות הלילה', time: z.chatzotNight, desc: 'אמצע הלילה ההלכתי', category: 'night' },
      ],
      shabbat: context.candleLighting || context.havdalah ? [
        ...(context.candleLighting ? [{ label: 'הדלקת נרות', time: context.candleLighting as unknown as Date, desc: '18 דקות לפני השקיעה', category: 'shabbat' as const }] : []),
        ...(context.havdalah ? [{ label: 'צאת שבת / הבדלה', time: context.havdalah as unknown as Date, desc: 'סיום שבת, 50 דקות אחרי השקיעה', category: 'shabbat' as const }] : []),
      ] : [],
    };
  }, [context]);

  const shabbatEvents = useMemo(
    () => events.filter((e) => e.getDesc().startsWith('Parashat') || e.getDesc().includes('Shabbat')),
    [events]
  );

  const moladEvent = useMemo(() => events.find((e) => e.getDesc().includes('Molad')), [events]);

  if (!context?.zmanim) {
    return (
      <div className="screen">
        <StandardHeader title="זמני היום" showBack={true} />
        <div className="container zmanim-empty">
          <p>לא ניתן לחשב זמנים.</p>
          <p>יש לאפשר שירותי מיקום בהגדרות.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <StandardHeader title="זמני היום" showBack={true} />
      <div className="container fade-in zmanim-container">

        {/* Date header */}
        <div className="zmanim-date-header">
          <div className="zmanim-date-heb">{context.hebrewDate}</div>
          <div className="zmanim-date-greg">
            יום {DAYS_HE[context.dayOfWeek]}, {new Date(context.effectiveDate).toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })}
          </div>
        </div>

        {/* Location badge */}
        <div className="zmanim-location-strip">
          📍 זמנים לפי מיקומך הנוכחי
        </div>

        {/* Zman groups */}
        {ZMAN_GROUPS.map((group) => {
          const entries = zmanGroups[group.category];
          if (!entries || entries.length === 0) return null;

          return (
            <section key={group.category} className="zmanim-group">
              <h2 className="zmanim-group-title">
                <span className="zmanim-group-icon">{group.icon}</span>
                {group.title}
              </h2>
              <div className="zmanim-group-list card">
                {entries.map((entry) => {
                  const timeStr = formatTime(entry.time);
                  if (!timeStr) return null;
                  const isNext = isNextZman(entry.time, allTimes);
                  return (
                    <div key={entry.label} className={`zmanim-entry ${isNext ? 'zman-next' : ''}`}>
                      <div className="zmanim-entry-left">
                        <div className="zmanim-entry-label">
                          {isNext && <span className="zman-next-dot" />}
                          {entry.label}
                        </div>
                        {entry.desc && (
                          <div className="zmanim-entry-desc">{entry.desc}</div>
                        )}
                      </div>
                      <div className="zmanim-entry-time">{timeStr}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Calendar strip */}
        <section className="zmanim-month-section">
          <h2 className="zmanim-group-title">
            <span className="zmanim-group-icon">📅</span>
            חודש {monthNameHe}
          </h2>
          <div className="card zmanim-month-card">
            {moladEvent && (
              <div className="zmanim-month-row">
                <span className="zmanim-month-key">🌑 מולד</span>
                <span className="zmanim-month-val">{moladEvent.render('he-x-NoNikud')}</span>
              </div>
            )}
            {shabbatEvents.length > 0 && (
              <>
                <div className="zmanim-month-section-title">שבתות החודש</div>
                {shabbatEvents.map((e, i) => (
                  <div key={i} className="zmanim-month-row">
                    <span className="zmanim-month-key">
                      {e.getDate().renderGematriya(true).replace(/^[א-ת]+, /, '')}
                    </span>
                    <span className="zmanim-month-val">
                      {e.render('he-x-NoNikud').replace('פרשת ', '')}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
