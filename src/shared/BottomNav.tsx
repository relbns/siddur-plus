import { useEffect, useRef, useState, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'היום', icon: '🏠' },
  { to: '/siddur', label: 'סידור', icon: '📖' },
  { to: '/tehillim', label: 'תהילים', icon: '🎵' },
  { to: '/more', label: 'עוד', icon: '☰' },
];

// Routes where bottom nav should be completely hidden
const HIDDEN_ROUTES = ['/siddur/', '/tehillim/'];

export function BottomNav() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const location = useLocation();

  // Hide nav entirely on reader screens
  const isReaderRoute = HIDDEN_ROUTES.some(
    (r) => location.pathname.startsWith(r) && location.pathname !== r.slice(0, -1)
  );

  const handleScroll = useCallback(() => {
    const currentY = window.scrollY;
    const delta = currentY - lastScrollY.current;

    // Show when scrolling up more than 10px, hide when scrolling down more than 10px
    if (delta > 10) {
      setVisible(false);
    } else if (delta < -10) {
      setVisible(true);
    }

    // Always show at top of page
    if (currentY < 50) {
      setVisible(true);
    }

    lastScrollY.current = currentY;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Reset visibility on route change
  useEffect(() => {
    setVisible(true);
    lastScrollY.current = 0;
  }, [location.pathname]);

  if (isReaderRoute) return null;

  return (
    <nav
      className={`bottom-nav ${visible ? '' : 'bottom-nav--hidden'}`}
      aria-label="ניווט ראשי"
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `nav-item ${isActive ? 'active' : ''}`
          }
          aria-label={tab.label}
        >
          <span style={{ fontSize: '1.3rem' }}>{tab.icon}</span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
