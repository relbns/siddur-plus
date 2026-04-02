export function AboutScreen() {
  return (
    <div className="screen">
      <header className="app-header">
        <h1>אודות</h1>
      </header>
      <div className="container fade-in" style={{ paddingTop: 'var(--space-6)', textAlign: 'center' }}>
        {/* App Info */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontFamily: 'var(--font-prayer)', fontSize: 'var(--text-3xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
            סידור+
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            גרסה 0.1.0
          </p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
            אפליקציית סידור תפילה חכמה ומקיפה
          </p>
        </div>

        {/* Memorial Section */}
        <div className="card" style={{
          textAlign: 'center',
          padding: 'var(--space-6)',
          borderRight: '4px solid var(--color-primary)',
          marginBottom: 'var(--space-6)',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-prayer)',
            fontSize: 'var(--text-2xl)',
            color: 'var(--color-primary)',
            marginBottom: 'var(--space-4)',
          }}>
            לעילוי נשמת
          </h3>
          <p style={{
            fontFamily: 'var(--font-prayer)',
            fontSize: 'var(--text-lg)',
            lineHeight: 2,
            color: 'var(--color-text)',
          }}>
            {/* User will fill in grandparents' names */}
            סבא וסבתא ז״ל
          </p>
          <p style={{
            fontFamily: 'var(--font-prayer)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-secondary)',
            marginTop: 'var(--space-3)',
          }}>
            תהא נשמתם צרורה בצרור החיים
          </p>
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
