import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BookOpen, Music, Home, Settings, Info, X, Scale } from 'lucide-react';
import { useSidebarStore } from '../core/sidebar-store';
import './Sidebar.css';

const navItems = [
  { to: '/', label: 'היום', icon: Home },
  { to: '/siddur', label: 'סידור', icon: BookOpen },
  { to: '/tehillim', label: 'תהילים', icon: Music },
  { to: '/siddur/parashat-haman', label: 'פרשת המן', icon: Scale },
  { to: '/siddur/tefilat-hashlah', label: 'תפילת השל״ה', icon: BookOpen },
  { to: '/settings', label: 'הגדרות', icon: Settings },
  { to: '/about', label: 'אודות', icon: Info },
];

export function Sidebar() {
  const { isOpen, setOpen } = useSidebarStore();
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, setOpen]);

  return (
    <>
      {isOpen && (
        <div className="sidebar-backdrop fade-in" onClick={() => setOpen(false)} />
      )}

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '1.4rem' }}>📖</span>
            <span>סידור+</span>
          </h2>
          <button className="sidebar-close" onClick={() => setOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">תפריט ראשי</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                end={item.to === '/'}
              >
                <Icon size={20} className="sidebar-link-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </>
  );
}
