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
      <header className="app-header">
        <h1>סידור</h1>
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
              <button key={b.id} className="prayer-list-item card">
                <span className="prayer-item-icon">{b.icon}</span>
                <div className="prayer-item-text">
                  <span className="prayer-item-title">{b.title}</span>
                </div>
                <span className="prayer-item-arrow">‹</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
