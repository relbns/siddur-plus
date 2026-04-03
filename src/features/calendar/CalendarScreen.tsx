import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HDate, HebrewCalendar, flags as hebcalFlags } from '@hebcal/core';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { StandardHeader } from '../../shared/Header';
import { useContextStore } from '../../core/stores';
import './CalendarScreen.css';

const HEB_MONTHS_SHORT: Record<string, string> = {
  Nisan: 'ניסן', Iyyar: 'אייר', Sivan: 'סיוון', Tamuz: 'תמוז', Av: 'אב',
  Elul: 'אלול', Tishrei: 'תשרי', Cheshvan: 'חשוון', Kislev: 'כסליו',
  Tevet: 'טבת', Shvat: 'שבט', Adar: 'אדר', 'Adar I': 'אדר א׳', 'Adar II': 'אדר ב׳',
};

const HEB_YEARS: Record<number, string> = {
  5785: 'תשפ״ה', 5786: 'תשפ״ו', 5787: 'תשפ״ז', 5788: 'תשפ״ח',
};

function formatHebYear(y: number): string {
  return HEB_YEARS[y] ?? String(y);
}

/** Convert a number 1-30 to Hebrew gematria */
function toGematria(n: number): string {
  const ONES: string[] = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  const TENS: string[] = ['', 'י', 'כ', 'ל'];
  const SPECIAL: Record<number, string> = { 15: 'ט״ו', 16: 'ט״ז' };
  if (SPECIAL[n]) return SPECIAL[n]!;
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const tensChar = TENS[tens] ?? '';
  const onesChar = ONES[ones] ?? '';
  if (n >= 20) return tensChar + (ones ? '״' + onesChar : '');
  if (n >= 10) return (ones ? (TENS[1] ?? 'י') + '״' + onesChar : (TENS[1] ?? 'י'));
  if (n === 10) return 'י';
  return ONES[ones] ?? '';
}

interface CalendarDay {
  greg: Date;
  hebDay: number;
  hebMonth: number;
  hebYear: number;
  isToday: boolean;
  isShabbat: boolean;
  specialType: 'yomtov' | 'roshchodesh' | 'minor' | null;
  specialLabel: string | null;
  isCurrentMonth: boolean;
}

function buildMonthGrid(hebrewMonth: number, hebrewYear: number, todayGreg: Date): CalendarDay[] {
  const hStart = new HDate(1, hebrewMonth, hebrewYear);
  const gregStart = hStart.greg();

  // Find last day of month
  let lastDay = 29;
  try {
    new HDate(30, hebrewMonth, hebrewYear); // throws if month has 29 days
    lastDay = 30;
  } catch { lastDay = 29; }

  const hEnd = new HDate(lastDay, hebrewMonth, hebrewYear);
  const gregEnd = hEnd.greg();

  // Collect events for the whole month
  const events = HebrewCalendar.calendar({
    start: gregStart,
    end: gregEnd,
    il: true,
    sedrot: false,
    omer: true,
  });

  const eventMap = new Map<string, { type: 'yomtov' | 'roshchodesh' | 'minor'; label: string }>();
  for (const ev of events) {
    const mask = ev.getFlags();
    const key = ev.getDate().greg().toDateString();
    let type: 'yomtov' | 'roshchodesh' | 'minor' | null = null;
    if (mask & (hebcalFlags.CHAG | hebcalFlags.YOM_TOV_ENDS)) type = 'yomtov';
    else if (mask & hebcalFlags.ROSH_CHODESH) type = 'roshchodesh';
    else if (mask & (hebcalFlags.MINOR_HOLIDAY | hebcalFlags.MAJOR_FAST | hebcalFlags.MINOR_FAST)) type = 'minor';
    if (type && !eventMap.has(key)) {
      eventMap.set(key, { type, label: ev.render('he-x-NoNikud') });
    }
  }

  // Build 7-column grid starting from Sunday
  const days: CalendarDay[] = [];
  // Pad from first day's weekday (0=Sun)
  const startDow = gregStart.getDay();
  for (let i = 0; i < startDow; i++) {
    const g = new Date(gregStart);
    g.setDate(g.getDate() - (startDow - i));
    const hd = new HDate(g);
    days.push({
      greg: g, hebDay: hd.getDate(), hebMonth: hd.getMonth(), hebYear: hd.getFullYear(),
      isToday: g.toDateString() === todayGreg.toDateString(),
      isShabbat: g.getDay() === 6,
      specialType: null, specialLabel: null, isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= lastDay; d++) {
    const hd = new HDate(d, hebrewMonth, hebrewYear);
    const g = hd.greg();
    const key = g.toDateString();
    const ev = eventMap.get(key);
    days.push({
      greg: g, hebDay: d, hebMonth: hebrewMonth, hebYear: hebrewYear,
      isToday: g.toDateString() === todayGreg.toDateString(),
      isShabbat: g.getDay() === 6,
      specialType: ev?.type ?? null,
      specialLabel: ev?.label ?? null,
      isCurrentMonth: true,
    });
  }

  // Pad to complete last week
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const g = new Date(gregEnd);
      g.setDate(g.getDate() + i);
      const hd = new HDate(g);
      days.push({
        greg: g, hebDay: hd.getDate(), hebMonth: hd.getMonth(), hebYear: hd.getFullYear(),
        isToday: g.toDateString() === todayGreg.toDateString(),
        isShabbat: g.getDay() === 6,
        specialType: null, specialLabel: null, isCurrentMonth: false,
      });
    }
  }

  return days;
}

function getMonthEvents(hebrewMonth: number, hebrewYear: number) {
  const hStart = new HDate(1, hebrewMonth, hebrewYear);
  let lastDay = 29;
  try { new HDate(30, hebrewMonth, hebrewYear); lastDay = 30; } catch { /* 29 */ }
  const hEnd = new HDate(lastDay, hebrewMonth, hebrewYear);
  return HebrewCalendar.calendar({
    start: hStart.greg(), end: hEnd.greg(), il: true, sedrot: true, molad: true,
  });
}

export function CalendarScreen() {
  const navigate = useNavigate();
  const context = useContextStore((s) => s.context);

  const todayGreg = useMemo(() => context?.effectiveDate ?? new Date(), [context]);
  const todayHeb = useMemo(() => new HDate(todayGreg), [todayGreg]);

  const [viewMonth, setViewMonth] = useState(todayHeb.getMonth());
  const [viewYear, setViewYear] = useState(todayHeb.getFullYear());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const grid = useMemo(
    () => buildMonthGrid(viewMonth, viewYear, todayGreg),
    [viewMonth, viewYear, todayGreg]
  );

  const monthEvents = useMemo(() => getMonthEvents(viewMonth, viewYear), [viewMonth, viewYear]);

  const moladEvent = useMemo(
    () => monthEvents.find((e) => e.getDesc().includes('Molad')),
    [monthEvents]
  );

  // Hebrew month name tabs
  const monthName = HEB_MONTHS_SHORT[new HDate(1, viewMonth, viewYear).getMonthName()] ?? '';

  function prevMonth() {
    const hd = new HDate(1, viewMonth, viewYear);
    const prev = new HDate(hd.abs() - 1);
    setViewMonth(prev.getMonth());
    setViewYear(prev.getFullYear());
    setSelectedDay(null);
  }

  function nextMonth() {
    let lastDay = 29;
    try { new HDate(30, viewMonth, viewYear); lastDay = 30; } catch { /* 29 */ }
    const hd = new HDate(lastDay, viewMonth, viewYear);
    const next = new HDate(hd.abs() + 1);
    setViewMonth(next.getMonth());
    setViewYear(next.getFullYear());
    setSelectedDay(null);
  }

  function goToToday() {
    setViewMonth(todayHeb.getMonth());
    setViewYear(todayHeb.getFullYear());
    setSelectedDay(null);
  }

  // Day detail for selected or today
  const detailDay = selectedDay ?? grid.find((d) => d.isToday) ?? null;

  const detailEvents = useMemo(() => {
    if (!detailDay) return [];
    return HebrewCalendar.calendar({
      start: detailDay.greg, end: detailDay.greg, il: true, sedrot: true, omer: true,
    });
  }, [detailDay]);

  return (
    <div className="screen calendar-screen">
      <StandardHeader title="לוח שנה" showBack={true} onBack={() => navigate('/')} />

      <div className="calendar-container">
        {/* Month navigation */}
        <div className="calendar-nav">
          <button className="cal-nav-btn" onClick={prevMonth} aria-label="חודש קודם">
            <ChevronRight size={22} />
          </button>
          <div className="cal-month-label">
            <span className="cal-month-name">{monthName}</span>
            <span className="cal-year">{formatHebYear(viewYear)}</span>
          </div>
          <button className="cal-nav-btn" onClick={nextMonth} aria-label="חודש הבא">
            <ChevronLeft size={22} />
          </button>
        </div>

        {/* Today button */}
        <button className="cal-today-btn" onClick={goToToday}>היום</button>

        {/* Day-of-week headers */}
        <div className="cal-grid">
          {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((d) => (
            <div key={d} className={`cal-dow ${d === 'ש' ? 'shabbat' : ''}`}>{d}</div>
          ))}

          {/* Day cells */}
          {grid.map((day, i) => (
            <button
              key={i}
              className={[
                'cal-day',
                !day.isCurrentMonth ? 'other-month' : '',
                day.isToday ? 'today' : '',
                day.isShabbat ? 'shabbat' : '',
                day.specialType === 'yomtov' ? 'yomtov' : '',
                day.specialType === 'roshchodesh' ? 'rosh-chodesh' : '',
                selectedDay?.greg.toDateString() === day.greg.toDateString() ? 'selected' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => setSelectedDay(day)}
            >
              <span className="cal-day-heb">{toGematria(day.hebDay)}</span>
              {day.specialType && (
                <span className={`cal-dot cal-dot-${day.specialType}`} />
              )}
            </button>
          ))}
        </div>

        {/* Molad strip */}
        {moladEvent && (
          <div className="cal-molad-strip">
            🌑 {moladEvent.render('he-x-NoNikud')}
          </div>
        )}

        {/* Day detail panel */}
        {detailDay && (
          <div className="cal-detail-panel">
            <div className="cal-detail-header">
              <span className="cal-detail-heb-date">
                {toGematria(detailDay.hebDay)} {HEB_MONTHS_SHORT[new HDate(detailDay.greg).getMonthName()] ?? ''} {formatHebYear(detailDay.hebYear)}
              </span>
              <span className="cal-detail-greg-date">
                {detailDay.greg.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            <div className="cal-detail-events">
              {detailEvents.length === 0 && (
                <div className="cal-detail-row">יום חול</div>
              )}
              {detailEvents.map((ev, i) => (
                <div key={i} className="cal-detail-row">
                  {ev.render('he-x-NoNikud')}
                </div>
              ))}
              {/* Zmanim for today */}
              {detailDay.isToday && context?.zmanim && (
                <>
                  <div className="cal-detail-zman-row">
                    <span>הנץ החמה</span>
                    <span>{new Date(context.zmanim.sunrise).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="cal-detail-zman-row">
                    <span>שקיעת החמה</span>
                    <span>{new Date(context.zmanim.sunset).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <button className="cal-zmanim-link" onClick={() => navigate('/zmanim')}>
                    לוח זמנים מלא ›
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
