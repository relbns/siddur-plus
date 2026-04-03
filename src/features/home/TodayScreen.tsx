import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContextStore } from '../../core/stores';
import { StandardHeader } from '../../shared/Header';
import { Sun, Moon, Clock, ChevronLeft, Heart, Sparkles, CalendarDays, Bell } from 'lucide-react';
import { ShabbatChecklist } from './ShabbatChecklist';
import { HDate, HebrewCalendar } from '@hebcal/core';
import './TodayScreen.css';

function formatTime(date: Date | null | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/** Compute molad string for current Hebrew month */
function getMoladStr(date: Date): string | null {
  try {
    const hd = new HDate(date);
    const events = HebrewCalendar.calendar({
      start: new HDate(1, hd.getMonth(), hd.getFullYear()).greg(),
      end: new HDate(1, hd.getMonth(), hd.getFullYear()).greg(),
      molad: true,
      il: true,
    });
    for (const ev of events) {
      if (ev.getDesc().includes('Molad')) {
        return ev.render('he-x-NoNikud');
      }
    }
  } catch { /* noop */ }
  return null;
}

export function TodayScreen() {
  const navigate = useNavigate();
  const context = useContextStore((s) => s.context);

  const dayName = useMemo(() => {
    if (!context) return '';
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[context.dayOfWeek];
  }, [context]);

  const moladStr = useMemo(() => {
    if (!context) return null;
    return context.moladStr ?? getMoladStr(context.effectiveDate);
  }, [context]);

  /** Build the primary title line for the day */
  const dayTitle = useMemo(() => {
    if (!context) return '';
    if (context.isShabbat) {
      const parasha = context.parasha ? ` — ${context.parasha}` : '';
      return `שבת קודש${parasha}`;
    }
    if (context.isErevShabbat) {
      const parasha = context.parasha ? ` — פרשת ${context.parasha.replace('פרשת ', '')}` : '';
      return `ערב שבת קודש${parasha}`;
    }
    if (context.holidayName) return context.holidayName;
    return `יום ${dayName}`;
  }, [context, dayName]);

  if (!context) {
    return (
      <div className="screen loading-screen">
        <div className="loader"></div>
        <p>טוען נתונים...</p>
      </div>
    );
  }

  return (
    <div className="screen">
      <StandardHeader title="סידור+" />

      <div className="container fade-in">

        {/* ===== Date Header ===== */}
        <header className="today-page-header">
          <div className="today-date-block">
            <h1 className="today-hebrew-date">{context.hebrewDate}</h1>
            <p className="today-day-name">
              {new Date(context.effectiveDate).toLocaleDateString('he-IL', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>

            {/* Primary day title — Shabbat / Erev Shabbat / Holiday */}
            <h2 className={`today-day-title ${context.isShabbat ? 'shabbat' : context.isErevShabbat ? 'erev-shabbat' : ''}`}>
              {dayTitle}
            </h2>

            {/* Extra info badges */}
            <div className="today-badges">
              {context.isRoshChodesh && <span className="badge badge-primary">ראש חודש</span>}
              {context.isCholHamoed && <span className="badge badge-accent">חול המועד</span>}
              {context.isFastDay && <span className="badge badge-warning">יום תענית</span>}
              {context.sefiraDay !== null && (
                <span className="badge badge-accent">
                  ספירת העומר: {context.sefiraDayHe ?? context.sefiraDay}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* ===== Prayers ===== */}
        <section className="prayers-section">
          <h2 className="section-title">תפילות היום</h2>
          <div className="prayer-grid">
            <PrayerCard
              title="שחרית"
              icon={<Sun size={24} />}
              time={context.zmanim?.sunrise ? `מ- ${formatTime(context.zmanim.sunrise)}` : undefined}
              onClick={() => navigate('/siddur/shacharit')}
              active={context.currentTimeSlot === 'morning'}
            />
            <PrayerCard
              title="מנחה"
              icon={<Clock size={24} />}
              time={context.zmanim?.minchaGedola ? `מ- ${formatTime(context.zmanim.minchaGedola)}` : undefined}
              onClick={() => navigate('/siddur/mincha')}
              active={context.currentTimeSlot === 'afternoon'}
            />
            <PrayerCard
              title="ערבית"
              icon={<Moon size={24} />}
              time={context.zmanim?.tzeitHakochavim ? `מ- ${formatTime(context.zmanim.tzeitHakochavim)}` : undefined}
              onClick={() => navigate('/siddur/maariv')}
              active={context.currentTimeSlot === 'evening' || context.currentTimeSlot === 'night'}
            />
          </div>
        </section>

        {/* ===== Shabbat Details ===== */}
        {(context.isShabbat || context.isErevShabbat) && (
          <section className="shabbat-section">
            <div className="shabbat-card">
              <div className="shabbat-card-header">
                <span className="shabbat-candle-icon">🕯️</span>
                <div>
                  <h3>{context.isShabbat ? 'שבת קודש' : 'שבת מתקרבת'}</h3>
                  {context.parasha && (
                    <span className="parasha-name">{context.parasha}</span>
                  )}
                  {context.haftarah && (
                    <div className="haftarah-name">הפטרה: {context.haftarah}</div>
                  )}
                </div>
              </div>
              <div className="shabbat-times">
                {context.candleLighting && (
                  <div className="time-row">
                    <span>🕯️ הדלקת נרות:</span>
                    <strong>{formatTime(context.candleLighting)}</strong>
                  </div>
                )}
                {context.havdalah && (
                  <div className="time-row">
                    <span>✨ צאת השבת:</span>
                    <strong>{formatTime(context.havdalah)}</strong>
                  </div>
                )}
              </div>
            </div>

            {context.isErevShabbat && (
              <div style={{ marginTop: 'var(--space-4)' }}>
                <ShabbatChecklist />
              </div>
            )}
          </section>
        )}

        {/* ===== Zmanim Section ===== */}
        {context.zmanim && (
          <section className="zmanim-section">
            <div className="section-title-row">
              <h2 className="section-title">זמני היום</h2>
              <button className="section-link-btn" onClick={() => navigate('/zmanim')}>
                לוח זמנים מלא ›
              </button>
            </div>
            <div className="zmanim-grid card">
              <ZmanRow label="עלות השחר" time={context.zmanim.alotHashachar} />
              <ZmanRow label="הנץ החמה" time={context.zmanim.sunrise} highlight />
              <ZmanRow label="סוף זמן ק״ש" time={context.zmanim.sofZmanShma} sub="גר״א" />
              <ZmanRow label="סוף זמן תפילה" time={context.zmanim.sofZmanTfilla} />
              <ZmanRow label="חצות" time={context.zmanim.chatzot} />
              <ZmanRow label="מנחה גדולה" time={context.zmanim.minchaGedola} />
              <ZmanRow label="שקיעה" time={context.zmanim.sunset} highlight />
              <ZmanRow label="צאת הכוכבים" time={context.zmanim.tzeitHakochavim} highlight />
            </div>
          </section>
        )}

        {/* ===== Month Info ===== */}
        <section className="month-info-section">
          <h2 className="section-title">פרטי החודש</h2>
          <div className="card month-info-card">
            {context.isRoshChodesh && (
              <div className="month-info-row">
                <span className="month-info-icon">🌙</span>
                <span>ראש חודש</span>
              </div>
            )}
            {moladStr && (
              <div className="month-info-row">
                <span className="month-info-icon">🌑</span>
                <span>מולד: {moladStr}</span>
              </div>
            )}
            {context.sefiraDay !== null && (
              <div className="month-info-row">
                <span className="month-info-icon">🌾</span>
                <span>ספירת העומר — יום {context.sefiraDay}</span>
                {context.sefiraDayHe && (
                  <span className="month-info-sub">{context.sefiraDayHe}</span>
                )}
              </div>
            )}
            <button
              className="month-calendar-link"
              onClick={() => navigate('/calendar')}
            >
              <CalendarDays size={16} />
              לוח שנה עברי ›
            </button>
          </div>
        </section>

        {/* ===== Quick Links ===== */}
        <section className="quick-links">
          <h2 className="section-title">קישורים מהירים</h2>
          <div className="links-grid">
            <button className="link-item" onClick={() => navigate('/siddur/birkat-hamazon')}>
              <Sun size={20} className="link-icon" />
              <span>ברכת המזון</span>
            </button>
            <button className="link-item" onClick={() => navigate('/siddur/parashat-haman')}>
              <Sparkles size={20} className="link-icon" />
              <span>פרשת המן</span>
            </button>
            <button className="link-item" onClick={() => navigate('/siddur/tefilat-hashlah')}>
              <Heart size={20} className="link-icon" />
              <span>תפילת השל״ה</span>
            </button>
            <button className="link-item" onClick={() => navigate('/tehillim')}>
              <Moon size={20} className="link-icon" />
              <span>תהילים</span>
            </button>
          </div>
        </section>

        {/* ===== Tools ===== */}
        <section className="tools-section">
          <h2 className="section-title">כלים ועוד</h2>
          <div className="tools-list">
            <button className="tool-card" onClick={() => navigate('/tefilat-haderech')}>
              <div className="tool-card-icon">🚗</div>
              <div className="tool-card-info">
                <span className="tool-card-title">תפילת הדרך</span>
                <span className="tool-card-desc">תפילה והקראה ליוצאים לדרך</span>
              </div>
              <ChevronLeft size={20} />
            </button>

            <button className="tool-card" onClick={() => navigate('/notifications')}>
              <div className="tool-card-icon"><Bell size={20} /></div>
              <div className="tool-card-info">
                <span className="tool-card-title">תזכורות</span>
                <span className="tool-card-desc">ספירת העומר, זמנים הלכתיים ועוד</span>
              </div>
              <ChevronLeft size={20} />
            </button>

            {context.isErevShabbat && (
              <button className="tool-card special" onClick={() => navigate('/siddur/candle-lighting')}>
                <div className="tool-card-icon">🕯️</div>
                <div className="tool-card-info">
                  <span className="tool-card-title">הדלקת נרות</span>
                  <span className="tool-card-desc">סדר הדלקת נרות שבת</span>
                </div>
                <ChevronLeft size={20} />
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ZmanRow({ label, time, sub, highlight }: { label: string; time: Date | null; sub?: string; highlight?: boolean }) {
  if (!time) return null;
  return (
    <div className={`zman-row ${highlight ? 'zman-highlight' : ''}`}>
      <div className="zman-label">
        <span>{label}</span>
        {sub && <small>({sub})</small>}
      </div>
      <div className="zman-time">
        {new Date(time).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}

function PrayerCard({ title, icon, time, onClick, active }: {
  title: string;
  icon: React.ReactNode;
  time?: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button className={`prayer-card ${active ? 'active' : ''}`} onClick={onClick}>
      <div className="prayer-card-icon">{icon}</div>
      <div className="prayer-card-info">
        <span className="prayer-card-title">{title}</span>
        {time && <span className="prayer-card-time">{time}</span>}
      </div>
    </button>
  );
}
