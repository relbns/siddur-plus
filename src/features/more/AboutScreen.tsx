import { StandardHeader } from '../../shared/Header';

export function AboutScreen() {
  return (
    <div className="screen">
      <StandardHeader title="אודות" showBack={true} />
      <div className="container fade-in" style={{ paddingTop: 'var(--space-6)', textAlign: 'center' }}>
        {/* App Info */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontFamily: 'var(--font-prayer)', fontSize: 'var(--text-3xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
            סידור+
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', direction: 'ltr', display: 'inline-block' }}>
            גרסה {__APP_VERSION__} ({__COMMIT_HASH__})
          </p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
            אפליקציית סידור תפילה חכמה ומקיפה
          </p>
        </div>

        {/* Memorial Section */}
        <div className="card" style={{
          textAlign: 'center',
          padding: 'var(--space-8) var(--space-4)',
          borderTop: '6px solid var(--color-primary)',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 'var(--space-8)',
          background: 'linear-gradient(to bottom, var(--color-surface), var(--color-bg))',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-prayer)',
            fontSize: 'var(--text-3xl)',
            color: 'var(--color-primary)',
            marginBottom: 'var(--space-4)',
            letterSpacing: '0.02em'
          }}>
            לעילוי נשמת
          </h3>
          <div style={{
            fontFamily: 'var(--font-prayer)',
            fontSize: 'var(--text-xl)',
            lineHeight: 1.8,
            color: 'var(--color-text)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)'
          }}>
            {/* User filled in grandparents' names */}
            <div>ר׳ משה אליעזר בן ר׳ צבי</div>
            <div>מרת שרה צינה בת אהרון לייב</div>
            <div>ר׳ מרדכי איסר בן ר׳ מנחם מנדל</div>
            <div>מרת מאשה בת ר׳ אשר</div>
          </div>
          <div style={{
            width: '60px',
            height: '2px',
            background: 'var(--color-border)',
            margin: '0 auto var(--space-4)'
          }} />
          <div style={{
            fontFamily: 'var(--font-prayer)',
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-secondary)',
            opacity: 0.8
          }}>
            תהא נשמתם צרורה בצרור החיים
          </div>
        </div>

        {/* Credits */}
        <div style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.8,
        }}>
          <p style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>קרדיטים</p>
          <p>טקסטים מבוססים על מאגרים פתוחים של <strong>Sefaria</strong></p>
          <p>חישובי לוח עברי באמצעות <strong>@hebcal/core</strong></p>
          <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)' }}>
            נבנה באהבה 🇮🇱
          </p>
        </div>
      </div>
    </div>
  );
}
