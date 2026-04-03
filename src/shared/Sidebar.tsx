import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  BookOpen, Home, Settings, Info, X, ChevronDown, Clock,
  CalendarDays, Bell, Share2
} from 'lucide-react';
import { useSidebarStore } from '../core/sidebar-store';
import { usePrayerStore, PRAYER_CATALOG } from '../core/prayer-store';
import { useContextStore } from '../core/stores';
import './Sidebar.css';

function formatTime(date: Date | null | undefined): string | null {
  if (!date) return null;
  return new Date(date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
}

type ExpandedPrayers = Record<string, boolean>;

export function Sidebar() {
  const { isOpen, setOpen } = useSidebarStore();
  const location = useLocation();
  const context = useContextStore((s) => s.context);
  const { currentPrayerId, currentSections } = usePrayerStore();

  // Track which prayer accordion is expanded
  const [expanded, setExpanded] = useState<ExpandedPrayers>({});

  // Auto-expand the currently active prayer in sidebar
  useEffect(() => {
    if (currentPrayerId) {
      setExpanded((prev) => ({ ...prev, [currentPrayerId]: true }));
    }
  }, [currentPrayerId]);

  // Close sidebar on navigation
  useEffect(() => {
    setOpen(false);
  }, [location, setOpen]);

  const toggleExpanded = (prayerId: string) => {
    setExpanded((prev) => ({ ...prev, [prayerId]: !prev[prayerId] }));
  };

  const handleShareApp = async () => {
    const url = window.location.origin + window.location.pathname;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'סידור+', text: 'סידור יהודי דיגיטלי', url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('הקישור הועתק!');
      }
    } catch { /* cancelled */ }
  };

  // Group prayers by category
  const categories = [
    {
      label: 'תפילות',
      prayers: PRAYER_CATALOG.filter((p) => p.category === 'תפילות'),
    },
    {
      label: 'ברכות',
      prayers: PRAYER_CATALOG.filter((p) => p.category === 'ברכות'),
    },
  ];

  /** Get the sections to display for a given prayer:
   *  If we're currently inside that prayer, use live sections (from store).
   *  Otherwise, use the static catalog data. */
  const getSections = (prayerId: string) => {
    if (currentPrayerId === prayerId && currentSections.length > 0) {
      return currentSections;
    }
    return PRAYER_CATALOG.find((p) => p.id === prayerId)?.sections ?? [];
  };

  return (
    <>
      {isOpen && (
        <div className="sidebar-backdrop fade-in" onClick={() => setOpen(false)} />
      )}

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="sidebar-brand-icon">📖</span>
            <span className="sidebar-brand-name">סידור+</span>
          </div>
          <button className="sidebar-close" onClick={() => setOpen(false)} aria-label="סגור תפריט">
            <X size={22} />
          </button>
        </div>

        {/* Hebrew date + quick zmanim */}
        {context && (
          <div className="sidebar-today-bar">
            <div className="sidebar-today-date">{context.hebrewDate}</div>
            <div className="sidebar-today-zmanim">
              {context.zmanim && (
                <>
                  <span className="sidebar-zman-item">
                    <Clock size={12} />
                    נץ: {formatTime(context.zmanim.sunrise)}
                  </span>
                  <span className="sidebar-zman-item">
                    <Clock size={12} />
                    שקיעה: {formatTime(context.zmanim.sunset)}
                  </span>
                </>
              )}
              {context.sefiraDay && (
                <span className="sidebar-sefirah">ספירה: {context.sefiraDay}</span>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          {/* Main nav links */}
          <div className="sidebar-section-label">ניווט ראשי</div>

          <NavLink
            to="/"
            end
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Home size={18} className="sidebar-link-icon" />
            <span>היום</span>
          </NavLink>

          <NavLink
            to="/calendar"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <CalendarDays size={18} className="sidebar-link-icon" />
            <span>לוח שנה</span>
          </NavLink>

          <NavLink
            to="/zmanim"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Clock size={18} className="sidebar-link-icon" />
            <span>זמני היום</span>
          </NavLink>

          {/* Prayer groups with accordion */}
          {categories.map((cat) => (
            <div key={cat.label}>
              <div className="sidebar-section-label">{cat.label}</div>
              {cat.prayers.map((prayer) => {
                const sections = getSections(prayer.id);
                const isExpanded = !!expanded[prayer.id];
                const isActivePrayer = location.pathname === `/siddur/${prayer.id}` || currentPrayerId === prayer.id;

                return (
                  <div key={prayer.id} className="sidebar-accordion">
                    <div className={`sidebar-prayer-row ${isActivePrayer ? 'active-prayer' : ''}`}>
                      <Link
                        to={`/siddur/${prayer.id}`}
                        className="sidebar-prayer-name"
                      >
                        <BookOpen size={16} className="sidebar-link-icon" />
                        <span>{prayer.title}</span>
                      </Link>
                      {sections.length > 0 && (
                        <button
                          className={`sidebar-accordion-toggle ${isExpanded ? 'open' : ''}`}
                          onClick={() => toggleExpanded(prayer.id)}
                          aria-label={isExpanded ? 'כווץ' : 'הרחב'}
                        >
                          <ChevronDown size={15} />
                        </button>
                      )}
                    </div>

                    {/* Accordion sections */}
                    {isExpanded && sections.length > 0 && (
                      <div className="sidebar-sections fade-in">
                        {sections.map((section) => (
                          <Link
                            key={section.id}
                            to={`/siddur/${prayer.id}?section=${section.id}`}
                            className="sidebar-section-link"
                          >
                            {section.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Other links */}
          <div className="sidebar-section-label">עוד</div>
          <NavLink
            to="/tehillim"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <BookOpen size={18} className="sidebar-link-icon" />
            <span>תהילים</span>
          </NavLink>
          <NavLink
            to="/notifications"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Bell size={18} className="sidebar-link-icon" />
            <span>תזכורות</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Settings size={18} className="sidebar-link-icon" />
            <span>הגדרות</span>
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Info size={18} className="sidebar-link-icon" />
            <span>אודות</span>
          </NavLink>

          <button className="sidebar-link sidebar-share-btn" onClick={handleShareApp}>
            <Share2 size={18} className="sidebar-link-icon" />
            <span>שתף את האפליקציה</span>
          </button>
        </nav>
      </div>
    </>
  );
}
