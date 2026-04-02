import { Link } from 'react-router-dom';
import './SiddurScreen.css';

const PRAYERS = [
  { id: 'shacharit', title: 'שחרית', icon: '🌅', desc: 'תפילת הבוקר' },
  { id: 'mincha', title: 'מנחה', icon: '☀️', desc: 'תפילת אחר הצהריים' },
  { id: 'maariv', title: 'ערבית', icon: '🌙', desc: 'תפילת הערב' },
  { id: 'bedtime-shema', title: 'קריאת שמע על המיטה', icon: '🌌', desc: '' },
];

const BRACHOT = [
  { id: 'birkat-hamazon', title: 'ברכת המזון', icon: '🍞' },
  { id: 'mein-shalosh', title: 'מעין שלוש', icon: '🫒' },
  { id: 'asher-yatzar', title: 'אשר יצר', icon: '🙏' },
];

export function SiddurScreen() {
  return (
    <div className="screen">
      <header className="app-header" style={{ justifyContent: 'space-between', padding: '0 var(--space-4)' }}>
        <h1>סידור</h1>
        <Link to="/search" style={{ fontSize: '1.5rem', textDecoration: 'none', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="חיפוש">
          🔍
        </Link>
      </header>

      <div className="container fade-in">
        <section className="siddur-section">
          <h2 className="section-title">תפילות יומיות</h2>
          <div className="prayer-list">
            {PRAYERS.map((p) => (
              <Link key={p.id} to={`/siddur/${p.id}`} className="prayer-list-item card">
                <span className="prayer-item-icon">{p.icon}</span>
                <div className="prayer-item-text">
                  <span className="prayer-item-title">{p.title}</span>
                  {p.desc && <span className="prayer-item-desc">{p.desc}</span>}
                </div>
                <span className="prayer-item-arrow">‹</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="siddur-section">
          <h2 className="section-title">ברכות</h2>
          <div className="prayer-list">
            {BRACHOT.map((b) => (
              <Link key={b.id} to={`/siddur/${b.id}`} className="prayer-list-item card">
                <span className="prayer-item-icon">{b.icon}</span>
                <div className="prayer-item-text">
                  <span className="prayer-item-title">{b.title}</span>
                </div>
                <span className="prayer-item-arrow">‹</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
