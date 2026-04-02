import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContextStore } from '../../core/stores';
import type { AppContext } from '../../core/types';
import './ZmanimScreen.css';

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
  const navigate = useNavigate();
  const context = useContextStore((s: { context: AppContext | null }) => s.context);

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
      <header className="app-header">
        <button className="reader-back-btn" onClick={() => navigate('/more')} aria-label="חזרה">←</button>
        <h1>זמני היום</h1>
        <div style={{ width: '2rem' }} />
      </header>
      <div className="container fade-in">
        <div className="zmanim-date">
          {context?.hebrewDate ?? ''}
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
      </div>
    </div>
  );
}
