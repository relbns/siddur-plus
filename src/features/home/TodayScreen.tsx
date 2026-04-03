import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContextStore } from '../../core/stores';
import { StandardHeader } from '../../shared/Header';
import { Sun, Moon, Clock, ChevronLeft, Heart, Sparkles } from 'lucide-react';
import { ShabbatChecklist } from './ShabbatChecklist';
import './TodayScreen.css';

export function TodayScreen() {
  const navigate = useNavigate();
  const context = useContextStore((s) => s.context);

  const dayName = useMemo(() => {
    if (!context) return '';
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[context.dayOfWeek];
  }, [context]);

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

        <header className="today-page-header">
          <div className="today-date-block">
            <h1 className="today-hebrew-date">{context.hebrewDate}</h1>
            <p className="today-day-name">יום {dayName}</p>
            {context.holidayName && <h2 className="today-holiday">{context.holidayName}</h2>}
            {context.parasha && !context.isYomTov && (
              <div className="parasha-badge fade-in">
                <span className="parasha-label">פרשת השבוע:</span>
                <span className="parasha-value">
                  {context.isErevShabbat
                    ? `ערב שבת קודש ״${context.parasha.replace('פרשת ', '')}״`
                    : context.parasha.startsWith('פרשת') ? context.parasha : `פרשת ${context.parasha}`}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Badges */}
        <div className="today-badges">
          {context.isRoshChodesh && <span className="badge badge-primary">ראש חודש</span>}
          {context.sefiraDay !== null && (
            <span className="badge badge-accent">ספירת העומר: {context.sefiraDay}</span>
          )}
        </div>

        {/* Prayers Selection */}
        <section className="prayers-section">
          <h2 className="section-title">תפילות היום</h2>
          <div className="prayer-grid">
            <PrayerCard 
              title="שחרית" 
              icon={<Sun size={24} />} 
              time={context.zmanim?.sunrise ? `מ- ${context.zmanim.sunrise.toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})}` : undefined}
              onClick={() => navigate('/siddur/shacharit')}
              active={context.currentTimeSlot === 'morning'}
            />
            <PrayerCard 
              title="מנחה" 
              icon={<Clock size={24} />} 
              onClick={() => navigate('/siddur/mincha')}
              active={context.currentTimeSlot === 'afternoon'}
            />
            <PrayerCard 
              title="ערבית" 
              icon={<Moon size={24} />} 
              onClick={() => navigate('/siddur/maariv')}
              active={context.currentTimeSlot === 'evening' || context.currentTimeSlot === 'night'}
            />
          </div>
        </section>

        {/* Shabbat Card */}
        {(context.isShabbat || context.isErevShabbat) && (
          <section className="shabbat-section">
            <div className="shabbat-card">
              <div className="shabbat-card-header">
                <h3>{context.isShabbat ? 'שבת קודש' : 'שבת מתקרבת'}</h3>
                <span className="parasha-name">{context.parasha}</span>
              </div>
              <div className="shabbat-times">
                {context.candleLighting && (
                  <div className="time-row">
                    <span>הדלקת נרות:</span>
                    <strong>{new Date(context.candleLighting).toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})}</strong>
                  </div>
                )}
                {context.havdalah && (
                  <div className="time-row">
                    <span>צאת השבת:</span>
                    <strong>{new Date(context.havdalah).toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})}</strong>
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

        {/* Zmanim Section */}
        {context.zmanim && (
          <section className="zmanim-section">
            <h2 className="section-title">זמני היום</h2>
            {!useContextStore.getState().context?.zmanim && (
              <p className="zmanim-hint">מציג זמנים לפי ירושלים (מיקום לא זוהה)</p>
            )}
            <div className="zmanim-grid card">
              <ZmanRow label="עלות השחר" time={context.zmanim.alotHashachar} />
              <ZmanRow label="הנץ החמה" time={context.zmanim.sunrise} />
              <ZmanRow label="סוף זמן קריאת שמע" time={context.zmanim.sofZmanShma} sub="אג״א" />
              <ZmanRow label="סוף זמן תפילה" time={context.zmanim.sofZmanTfilla} />
              <ZmanRow label="חצות היום" time={context.zmanim.chatzot} />
              <ZmanRow label="מנחה גדולה" time={context.zmanim.minchaGedola} />
              <ZmanRow label="שקיעה" time={context.zmanim.sunset} />
              <ZmanRow label="צאת הכוכבים" time={context.zmanim.tzeitHakochavim} />
            </div>
          </section>
        )}

        {/* Quick Links */}
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

        {/* Tools Section */}
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

function ZmanRow({ label, time, sub }: { label: string; time: Date | null; sub?: string }) {
  if (!time) return null;
  return (
    <div className="zman-row">
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
