import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sun, Sunset, Moon, Sunrise, Wheat, Droplets, ChevronLeft, BookHeart, Clock } from 'lucide-react';
import { StandardHeader } from '../../shared/Header';
import { useContextStore } from '../../core/stores';
import './SiddurScreen.css';

interface PrayerItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  timeLabel?: string;
  recommended?: boolean;
}

interface BrachaItem {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const BRACHOT: BrachaItem[] = [
  { id: 'birkat-hamazon', title: 'ברכת המזון', icon: <Wheat size={22} /> },
  { id: 'mein-shalosh', title: 'מעין שלוש', icon: <Wheat size={22} /> },
  { id: 'asher-yatzar', title: 'אשר יצר', icon: <Droplets size={22} /> },
];

const SPECIAL: BrachaItem[] = [
  { id: 'kiddush', title: 'קידוש', icon: '🍷' as unknown as React.ReactNode },
  { id: 'parashat-haman', title: 'פרשת המן', icon: '✨' as unknown as React.ReactNode },
  { id: 'tefilat-hashlah', title: 'תפילת השל״ה', icon: <BookHeart size={22} /> },
];

function formatTime(date: Date | null | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function SiddurScreen() {
  const navigate = useNavigate();
  const context = useContextStore((s) => s.context);

  const prayers = useMemo((): PrayerItem[] => {
    const zmanim = context?.zmanim;
    const slot = context?.currentTimeSlot;
    return [
      {
        id: 'shacharit',
        title: 'שחרית',
        icon: <Sunrise size={22} />,
        timeLabel: zmanim?.sunrise ? `מ- ${formatTime(zmanim.sunrise)}` : undefined,
        recommended: slot === 'morning',
      },
      {
        id: 'mincha',
        title: 'מנחה',
        icon: <Sun size={22} />,
        timeLabel: zmanim?.minchaGedola ? `מ- ${formatTime(zmanim.minchaGedola)}` : undefined,
        recommended: slot === 'afternoon',
      },
      {
        id: 'maariv',
        title: 'ערבית',
        icon: <Sunset size={22} />,
        timeLabel: zmanim?.tzeitHakochavim ? `מ- ${formatTime(zmanim.tzeitHakochavim)}` : undefined,
        recommended: slot === 'evening' || slot === 'night',
      },
      {
        id: 'bedtime-shema',
        title: 'קריאת שמע על המיטה',
        icon: <Moon size={22} />,
        recommended: slot === 'night',
      },
    ];
  }, [context]);

  const showKiddush = context?.isShabbat || context?.isErevShabbat || context?.isYomTov || context?.isErevYomTov;

  return (
    <div className="screen">
      <StandardHeader
        title="סידור"
        rightElement={
          <Link to="/search" className="header-btn" aria-label="חיפוש">
            <Search size={22} />
          </Link>
        }
      />

      <div className="container fade-in">
        {/* Context strip */}
        {context && (context.isShabbat || context.isYomTov || context.isCholHamoed || context.sefiraDay !== null) && (
          <div className="siddur-context-strip">
            {context.isShabbat && <span className="siddur-ctx-badge shabbat">🕯️ שבת קודש</span>}
            {context.isYomTov && <span className="siddur-ctx-badge yomtov">✡️ {context.holidayName}</span>}
            {context.isCholHamoed && <span className="siddur-ctx-badge chol">חול המועד</span>}
            {context.sefiraDay !== null && (
              <span className="siddur-ctx-badge sefirah">🌾 ספירת העומר — יום {context.sefiraDay}</span>
            )}
          </div>
        )}

        {/* ===== תפילות ===== */}
        <section className="siddur-section">
          <h2 className="section-title">תפילות יומיות</h2>
          <div className="siddur-prayer-list">
            {prayers.map((p) => (
              <button
                key={p.id}
                className={`siddur-prayer-row ${p.recommended ? 'recommended' : ''}`}
                onClick={() => navigate(`/siddur/${p.id}`)}
              >
                <div className="siddur-prayer-icon">
                  {p.icon}
                </div>
                <div className="siddur-prayer-info">
                  <span className="siddur-prayer-title">{p.title}</span>
                  {p.timeLabel && (
                    <span className="siddur-prayer-time">
                      <Clock size={11} /> {p.timeLabel}
                    </span>
                  )}
                </div>
                {p.recommended && (
                  <span className="siddur-recommended-badge">עכשיו</span>
                )}
                <ChevronLeft size={18} className="siddur-prayer-arrow" />
              </button>
            ))}
          </div>
        </section>

        {/* ===== קידוש (contextual) ===== */}
        {showKiddush && (
          <section className="siddur-section">
            <h2 className="section-title">קידוש</h2>
            <button
              className="siddur-kiddush-card"
              onClick={() => navigate('/kiddush')}
            >
              <span className="siddur-kiddush-icon">🍷</span>
              <div className="siddur-kiddush-info">
                <span className="siddur-prayer-title">ספר קידושים</span>
                <span className="siddur-prayer-time">
                  {context?.isShabbat ? 'קידוש לשבת' :
                    context?.isErevShabbat ? 'קידוש ליל שבת' :
                    context?.isYomTov ? `קידוש ל${context.holidayName}` :
                    'קידוש ליום טוב'}
                </span>
              </div>
              <ChevronLeft size={18} className="siddur-prayer-arrow" />
            </button>
          </section>
        )}

        {/* ===== ברכות ===== */}
        <section className="siddur-section">
          <h2 className="section-title">ברכות</h2>
          <div className="siddur-bracha-grid">
            {BRACHOT.map((b) => (
              <Link
                key={b.id}
                to={`/siddur/${b.id}`}
                className="siddur-bracha-card"
              >
                <span className="siddur-bracha-icon">{b.icon}</span>
                <span className="siddur-bracha-title">{b.title}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ===== תפילות מיוחדות ===== */}
        <section className="siddur-section">
          <h2 className="section-title">תפילות מיוחדות</h2>
          <div className="siddur-special-list">
            {SPECIAL.map((s) => (
              <button
                key={s.id}
                className="siddur-special-row"
                onClick={() => navigate(s.id === 'kiddush' ? '/kiddush' : `/siddur/${s.id}`)}
              >
                <span className="siddur-special-icon">{s.icon}</span>
                <span className="siddur-special-title">{s.title}</span>
                <ChevronLeft size={16} className="siddur-prayer-arrow" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
