import { Link } from 'react-router-dom';
import './MoreScreen.css';

interface MenuItem {
  to: string;
  icon: string;
  label: string;
  desc?: string;
}

const SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'תפילה וברכות',
    items: [
      { to: '/siddur/birkat-hamazon', icon: '🍞', label: 'ברכת המזון' },
      { to: '/tefilat-haderech', icon: '🚗', label: 'תפילת הדרך', desc: 'כולל הקראה' },
    ],
  },
  {
    title: 'הלכה ולימוד',
    items: [
      { to: '/halacha', icon: '⚖️', label: 'הלכה יומית' },
      { to: '/daily-learning', icon: '📚', label: 'לימוד יומי', desc: 'דף יומי, רמב״ם, משנה ברורה' },
    ],
  },
  {
    title: 'זמנים ולוח שנה',
    items: [
      { to: '/zmanim', icon: '🕐', label: 'זמני היום', desc: 'כל הזמנים ההלכתיים' },
      { to: '/date-converter', icon: '📅', label: 'ממיר תאריכים', desc: 'עברי ↔ לועזי' },
      { to: '/bar-mitzvah', icon: '🎉', label: 'מחשבון בר מצוה' },
    ],
  },
  {
    title: 'הגדרות',
    items: [
      { to: '/settings', icon: '⚙️', label: 'הגדרות' },
      { to: '/about', icon: 'ℹ️', label: 'אודות' },
    ],
  },
];

export function MoreScreen() {
  return (
    <div className="screen">
      <header className="app-header">
        <h1>עוד</h1>
      </header>
      <div className="container fade-in more-hub">
        {SECTIONS.map((section) => (
          <section key={section.title} className="more-section">
            <h2 className="more-section-title">{section.title}</h2>
            <div className="more-list">
              {section.items.map((item) => (
                <Link key={item.to} to={item.to} className="more-item card">
                  <span className="more-item-icon">{item.icon}</span>
                  <div className="more-item-text">
                    <span className="more-item-label">{item.label}</span>
                    {item.desc && <span className="more-item-desc">{item.desc}</span>}
                  </div>
                  <span className="more-item-arrow">‹</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
