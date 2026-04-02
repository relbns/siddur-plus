import { useContextStore } from '../../core/stores';
import './TodayScreen.css';

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const PRAYER_SUGGESTIONS: Record<string, { label: string; icon: string }> = {
  morning: { label: 'שחרית', icon: '🌅' },
  afternoon: { label: 'מנחה', icon: '☀️' },
  evening: { label: 'ערבית', icon: '🌙' },
  night: { label: 'קריאת שמע על המיטה', icon: '🌌' },
};

export function TodayScreen() {
  const context = useContextStore((s) => s.context);

  if (!context) {
    return (
      <div className="screen container" style={{ paddingTop: 'var(--space-8)' }}>
        <p>טוען...</p>
      </div>
    );
  }

  const dayName = DAYS_HE[context.dayOfWeek] ?? '';
  const suggestion = PRAYER_SUGGESTIONS[context.currentTimeSlot];

  // Build contextual badges
  const badges: string[] = [];
  if (context.isShabbat) badges.push('שבת קודש');
  if (context.isYomTov) badges.push('יום טוב');
  if (context.isCholHamoed) badges.push('חול המועד');
  if (context.isRoshChodesh) badges.push('ראש חודש');
  if (context.isChanukah) badges.push('חנוכה');
  if (context.isPurim) badges.push('פורים');
  if (context.isFastDay) badges.push('יום צום');
  if (context.isErevShabbat) badges.push('ערב שבת');

  // Build daily info items
  const infoItems: { icon: string; label: string }[] = [];
  if (!context.tachanunAllowed) infoItems.push({ icon: 'ℹ️', label: 'לא אומרים תחנון' });
  if (!context.tefillinAllowed) infoItems.push({ icon: '🚫', label: 'לא מניחים תפילין' });
  if (context.hallelType === 'full') infoItems.push({ icon: '🎶', label: 'הלל שלם' });
  if (context.hallelType === 'half') infoItems.push({ icon: '🎵', label: 'חצי הלל' });
  if (context.yaalehVeyavo) infoItems.push({ icon: '📜', label: 'יעלה ויבוא' });
  if (context.sefiraDayHe) infoItems.push({ icon: '🔢', label: `ספירת העומר: ${context.sefiraDayHe}` });

  return (
    <div className="screen">
      {/* Header */}
      <header className="today-header">
        <div className="today-date-block">
          <h1 className="today-hebrew-date">{context.hebrewDate}</h1>
          <p className="today-day-name">יום {dayName}</p>
          {context.holidayName && <p className="today-holiday">{context.holidayName}</p>}
          {context.parasha && !context.isYomTov && (
            <p className="today-parasha">
              {context.parasha.startsWith('פרשת') ? context.parasha : `פרשת ${context.parasha}`}
            </p>
          )}
        </div>
      </header>

      <div className="container fade-in">
        {/* Badges */}
        {badges.length > 0 && (
          <div className="today-badges">
            {badges.map((b) => (
              <span key={b} className="badge">{b}</span>
            ))}
          </div>
        )}

        {/* Next Prayer Suggestion */}
        {suggestion && (
          <div className="card today-prayer-card">
            <span className="prayer-card-icon">{suggestion.icon}</span>
            <div>
              <p className="prayer-card-label">התפילה הבאה</p>
              <p className="prayer-card-name">{suggestion.label}</p>
            </div>
          </div>
        )}

        {/* Daily Info */}
        {infoItems.length > 0 && (
          <section className="today-info-section">
            <h2 className="section-title">מידע יומי</h2>
            <div className="today-info-grid">
              {infoItems.map((item) => (
                <div key={item.label} className="info-chip">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section className="today-actions">
          <h2 className="section-title">גישה מהירה</h2>
          <div className="action-grid">
            <a href="#/tehillim" className="action-card">
              <span className="action-icon">🎵</span>
              <span>תהילים יומי</span>
            </a>
            <a href="#/siddur" className="action-card">
              <span className="action-icon">📖</span>
              <span>סידור</span>
            </a>
            <a href="#/halacha" className="action-card">
              <span className="action-icon">⚖️</span>
              <span>הלכה יומית</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
