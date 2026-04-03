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

function getMonthInfo(date: Date) {
  const hd = new HDate(date);
  const engMonth = hd.getMonthName();
  const monthNameHe = HEB_MONTHS[engMonth] || engMonth;

  const startOfMonth = new HDate(1, hd.getMonth(), hd.getFullYear());
  const endOfMonth = new HDate(new HDate(1, hd.getMonth() + 1, hd.getFullYear()).abs() - 1);
  
  const events = HebrewCalendar.calendar({
    start: startOfMonth.greg(),
    end: endOfMonth.greg(),
    il: true,
    sedrot: true,
  });

  return { monthNameHe, events };
}

interface ZmanEntry {
  label: string;
  time: string | null;
  important?: boolean;
}

function formatTime(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function ZmanimScreen() {
  const context = useContextStore((s: { context: AppContext | null }) => s.context);

  const { monthNameHe, events } = useMemo(() => {
    return context ? getMonthInfo(context.effectiveDate) : { monthNameHe: '', events: [] };
  }, [context?.effectiveDate]);

  const shabbatsList = useMemo(() => {
    return events.filter(e => e.getDesc().startsWith('Parashat') || e.getDesc() === 'Shabbat Rosh Chodesh' || e.getDesc().includes('Shabbat'));
  }, [events]);

  const zmanim = useMemo((): ZmanEntry[] => {
    if (!context?.zmanim) return [];
    const z = context.zmanim;
    return [
      { label: 'עלות השחר', time: formatTime(z.alotHashachar) },
      { label: 'נץ החמה', time: formatTime(z.sunrise), important: true },
      { label: 'סוף זמן ק״ש מג״א', time: formatTime(z.sofZmanShmaMGA) },
      { label: 'סוף זמן ק״ש גר״א', time: formatTime(z.sofZmanShma), important: true },
      { label: 'סוף זמן תפילה מג״א', time: formatTime(z.sofZmanTfillaMGA) },
      { label: 'סוף זמן תפילה גר״א', time: formatTime(z.sofZmanTfilla), important: true },
      { label: 'חצות היום', time: formatTime(z.chatzot), important: true },
      { label: 'מנחה גדולה', time: formatTime(z.minchaGedola) },
      { label: 'מנחה קטנה', time: formatTime(z.minchaKetana) },
      { label: 'פלג המנחה', time: formatTime(z.plagHamincha) },
      { label: 'שקיעה', time: formatTime(z.sunset), important: true },
      { label: 'צאת הכוכבים', time: formatTime(z.tzeitHakochavim), important: true },
      { label: 'חצות הלילה', time: formatTime(z.chatzotNight) },
    ];
  }, [context?.zmanim]);

  return (
    <div className="screen">
      <StandardHeader title="זמני היום" showBack={true} />
      <div className="container fade-in">
        <div className="zmanim-date">
          יום {context ? DAYS_HE[context.dayOfWeek] : ''}, {context?.hebrewDate ?? ''}
        </div>

        {zmanim.length === 0 ? (
          <div className="zmanim-empty">
            <p>לא ניתן לחשב זמנים.</p>
            <p>יש לאפשר שירותי מיקום בהגדרות.</p>
          </div>
        ) : (
          <div className="zmanim-list">
            {zmanim.map((z) => (
              <div key={z.label} className={`zman-row ${z.important ? 'zman-important' : ''}`}>
                <span className="zman-label">{z.label}</span>
                <span className="zman-time">{z.time ?? '—'}</span>
              </div>
            ))}
          </div>
        )}

        {context?.candleLighting && (
          <div className="zmanim-special card" style={{ marginTop: 'var(--space-4)' }}>
            <span>🕯️ הדלקת נרות</span>
            <span className="zman-time-big">{formatTime(context.candleLighting as unknown as Date)}</span>
          </div>
        )}

        <section style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>חודש {monthNameHe} ושבתות</h2>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {events.filter(e => e.getDesc().includes('Molad')).map(e => (
              <div key={e.getDesc()} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-border)' }}>
                <span>מולד</span>
                <span>{e.render('he')}</span>
              </div>
            ))}
            
            <div style={{ marginTop: 'var(--space-2)', fontWeight: 600 }}>שבתות החודש:</div>
            {shabbatsList.map((e, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                <span>{e.getDate().renderGematriya(true).replace(/^[א-ת]+, /,'')}</span>
                <span>{e.render('he').replace('פרשת ', '')}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
