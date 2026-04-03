import { Link } from 'react-router-dom';
import { Search, Sun, Sunset, Moon, Sunrise, Wheat, Droplets } from 'lucide-react';
import { StandardHeader } from '../../shared/Header';
import './SiddurScreen.css';

const PRAYERS = [
  { id: 'shacharit', title: 'שחרית', Icon: Sunrise },
  { id: 'mincha', title: 'מנחה', Icon: Sun },
  { id: 'maariv', title: 'ערבית', Icon: Sunset },
  { id: 'bedtime-shema', title: 'קריאת שמע על המיטה', Icon: Moon },
];

const BRACHOT = [
  { id: 'birkat-hamazon', title: 'ברכת המזון', Icon: Wheat },
  { id: 'mein-shalosh', title: 'מעין שלוש', Icon: Wheat },
  { id: 'asher-yatzar', title: 'אשר יצר', Icon: Droplets },
];

export function SiddurScreen() {
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
        <section className="siddur-section">
          <h2 className="section-title">תפילות יומיות</h2>
          <div className="prayer-list">
            {PRAYERS.map((p) => {
              const Icon = p.Icon;
              return (
                <Link key={p.id} to={`/siddur/${p.id}`} className="prayer-list-item card" style={{ textDecoration: 'none' }}>
                  <Icon size={24} style={{ color: 'var(--color-primary)' }} />
                  <div className="prayer-item-text">
                    <span className="prayer-item-title" style={{ color: 'var(--color-text)' }}>{p.title}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="siddur-section">
          <h2 className="section-title">ברכות</h2>
          <div className="prayer-list">
            {BRACHOT.map((b) => {
              const Icon = b.Icon;
              return (
                <Link key={b.id} to={`/siddur/${b.id}`} className="prayer-list-item card" style={{ textDecoration: 'none' }}>
                  <Icon size={24} style={{ color: 'var(--color-primary)' }} />
                  <div className="prayer-item-text">
                    <span className="prayer-item-title" style={{ color: 'var(--color-text)' }}>{b.title}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
