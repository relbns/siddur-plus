import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Settings, ChevronDown, Share2, Type } from 'lucide-react';
import { StandardHeader } from '../../shared/Header';
import type { PrayerDocument } from '../../core/types';
import { useContextStore, useSettingsStore } from '../../core/stores';
import { usePrayerStore } from '../../core/prayer-store';
import { ContentRenderer } from '../../shared/ContentRenderer';
import './PrayerReader.css';

const NUSACH_LABELS: Record<string, string> = {
  sefard: 'ספרד',
  ashkenaz: 'אשכנז',
  'edot-hamizrach': 'עדות המזרח',
};

const FONT_MIN = 0.8;
const FONT_MAX = 1.6;
const FONT_STEP = 0.1;

export function PrayerReader() {
  const { prayerId } = useParams<{ prayerId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lockSession, unlockSession, context } = useContextStore();
  const settings = useSettingsStore();
  const { setPrayerSections, clearPrayerSections } = usePrayerStore();

  const [document, setDocument] = useState<PrayerDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [shared, setShared] = useState(false);
  const initScrollDone = useRef(false);

  // Lock session on mount, unlock on unmount
  useEffect(() => {
    lockSession();
    return () => {
      unlockSession();
      clearPrayerSections();
    };
  }, [lockSession, unlockSession, clearPrayerSections]);

  // Load prayer document
  useEffect(() => {
    initScrollDone.current = false;
    setLoading(true);
    setDocument(null);

    async function loadPrayer() {
      try {
        const nusach = settings.nusach || 'sefard';
        const res = await fetch(`./data/prayer-${prayerId}-${nusach}.json`);
        if (res.ok) {
          const data: PrayerDocument = await res.json();
          setDocument(data);
          setActiveSection(data.sections[0]?.id ?? null);
          setPrayerSections(
            prayerId!,
            data.title,
            data.sections.map((s) => ({ id: s.id, title: s.title }))
          );
        }
      } catch (err) {
        console.error('Failed to load prayer:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPrayer();
  }, [prayerId, settings.nusach, setPrayerSections]);

  // Scroll to section from URL param on initial load
  useEffect(() => {
    if (!document || initScrollDone.current) return;
    const sectionParam = searchParams.get('section');
    if (sectionParam) {
      initScrollDone.current = true;
      setTimeout(() => scrollToSection(sectionParam), 400);
    } else {
      initScrollDone.current = true;
    }
  }, [document, searchParams]);

  const handleBack = useCallback(() => navigate('/siddur'), [navigate]);

  const scrollToSection = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    const el = globalThis.document.getElementById(`section-${sectionId}`);
    if (el) {
      const offset = 104;
      const bodyRect = globalThis.document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const offsetPosition = elementRect - bodyRect - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }, []);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}#/siddur/${prayerId}${activeSection ? `?section=${activeSection}` : ''}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: document?.title ?? 'תפילה', url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch { /* user cancelled */ }
  }, [prayerId, activeSection, document]);

  const activeSectionTitle = useMemo(
    () => document?.sections.find((s) => s.id === activeSection)?.title || 'בחר חלק...',
    [document, activeSection]
  );

  const fontScale = settings.fontScale ?? 1;
  const canDecrease = fontScale > FONT_MIN + 0.01;
  const canIncrease = fontScale < FONT_MAX - 0.01;

  if (loading) {
    return <div className="reader-loading"><span>טוען תפילה...</span></div>;
  }

  if (!document) {
    return (
      <div className="reader-loading">
        <span>תפילה לא נמצאה</span>
        <button className="btn btn-primary" onClick={handleBack} style={{ marginTop: 'var(--space-4)' }}>
          חזרה לסידור
        </button>
      </div>
    );
  }

  return (
    <div
      className="prayer-reader"
      style={{ '--reader-font-scale': fontScale } as React.CSSProperties}
      onClick={() => { if (showSettings) setShowSettings(false); }}
    >
      <StandardHeader
        title={document.title}
        showBack={true}
        onBack={handleBack}
        rightElement={
          <div className="reader-header-actions">
            {/* Font size */}
            <div className="font-size-controls">
              <button
                className="header-btn font-btn"
                onClick={() => settings.updateSetting('fontScale', Math.max(FONT_MIN, +(fontScale - FONT_STEP).toFixed(1)))}
                disabled={!canDecrease}
                aria-label="הקטן גופן"
                title="הקטן גופן"
              >
                <Type size={14} />
              </button>
              <button
                className="header-btn font-btn font-btn-large"
                onClick={() => settings.updateSetting('fontScale', Math.min(FONT_MAX, +(fontScale + FONT_STEP).toFixed(1)))}
                disabled={!canIncrease}
                aria-label="הגדל גופן"
                title="הגדל גופן"
              >
                <Type size={19} />
              </button>
            </div>

            {/* Share */}
            <button
              className={`header-btn ${shared ? 'shared' : ''}`}
              onClick={handleShare}
              aria-label="שיתוף תפילה"
              title={shared ? 'הקישור הועתק!' : 'שיתוף'}
              style={{ position: 'relative' }}
            >
              <Share2 size={20} />
              {shared && <span className="share-toast">הועתק!</span>}
            </button>

            {/* Settings */}
            <button
              className="header-btn"
              onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
              aria-label="הגדרות תפילה"
            >
              <Settings size={22} />
            </button>
          </div>
        }
      >
        {showSettings && (
          <div className="prayer-settings-dropdown card fade-in" onClick={(e) => e.stopPropagation()}>
            {/* Nusach switcher */}
            <h3 className="settings-title">נוסח</h3>
            <div className="nusach-switcher">
              {(['sefard', 'ashkenaz', 'edot-hamizrach'] as const).map((n) => (
                <button
                  key={n}
                  className={`nusach-btn ${settings.nusach === n ? 'active' : ''}`}
                  onClick={() => settings.updateSetting('nusach', n)}
                >
                  {NUSACH_LABELS[n]}
                </button>
              ))}
            </div>

            <h3 className="settings-title" style={{ marginTop: 'var(--space-3)' }}>מצב תפילה</h3>
            <label className="settings-radio">
              <input type="radio" name="prayerMode" checked={settings.prayerMode === 'regular'} onChange={() => settings.updateSetting('prayerMode', 'regular')} />
              מצב רגיל
            </label>
            <label className="settings-radio">
              <input type="radio" name="prayerMode" checked={settings.prayerMode === 'chazan'} onChange={() => settings.updateSetting('prayerMode', 'chazan')} />
              מצב חזן
            </label>
            <label className="settings-radio">
              <input type="radio" name="prayerMode" checked={settings.prayerMode === 'yachid'} onChange={() => settings.updateSetting('prayerMode', 'yachid')} />
              מצב יחיד
            </label>

            <h3 className="settings-title" style={{ marginTop: 'var(--space-3)' }}>אירועים מיוחדים</h3>
            <label className="settings-checkbox">
              <input type="checkbox" checked={settings.isMournerHouse} onChange={(e) => settings.updateSetting('isMournerHouse', e.target.checked)} />
              בית אבל
            </label>
            <label className="settings-checkbox">
              <input type="checkbox" checked={settings.forceNoTachanun} onChange={(e) => settings.updateSetting('forceNoTachanun', e.target.checked)} />
              ללא תחנון
            </label>

            <h3 className="settings-title" style={{ marginTop: 'var(--space-3)' }}>תצוגה</h3>
            <label className="settings-checkbox">
              <input type="checkbox" checked={settings.showNikud} onChange={(e) => settings.updateSetting('showNikud', e.target.checked)} />
              הצג ניקוד
            </label>
          </div>
        )}
      </StandardHeader>

      {/* Section Dropdown */}
      <nav className="section-dropdown-nav" aria-label="חלקי התפילה">
        <div className="custom-select-container">
          <button
            className="custom-select-trigger"
            onClick={(e) => { e.stopPropagation(); setShowSectionMenu(!showSectionMenu); setShowSettings(false); }}
          >
            <span>{activeSectionTitle}</span>
            <ChevronDown size={18} className={`select-arrow ${showSectionMenu ? 'open' : ''}`} />
          </button>

          {showSectionMenu && (
            <div className="custom-select-menu fade-in" onClick={(e) => e.stopPropagation()}>
              {document.sections.map((s) => (
                <button
                  key={s.id}
                  className={`custom-select-option ${activeSection === s.id ? 'active' : ''}`}
                  onClick={() => { scrollToSection(s.id); setShowSectionMenu(false); }}
                >
                  {s.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Content */}
      <main className="reader-content container" onClick={() => setShowSectionMenu(false)}>
        {/* Context badges */}
        {context && (
          <div className="reader-context-bar">
            <span className="reader-nusach-badge">{NUSACH_LABELS[settings.nusach]}</span>
            {context.isShabbat && <span className="reader-badge shabbat">שבת</span>}
            {context.isYomTov && <span className="reader-badge yomtov">{context.holidayName}</span>}
            {context.sefiraDay && <span className="reader-badge sefirah">עומר: {context.sefiraDay}</span>}
            {!context.tachanunAllowed && <span className="reader-badge no-tachanun">ללא תחנון</span>}
          </div>
        )}

        {document.sections.map((section) => {
          let isOmitted = false;
          let omitReason = '';

          if ((section.id === 'tachanun' || section.id === 'vidui') && context && !context.tachanunAllowed) {
            isOmitted = true;
            omitReason = 'אין תחנון היום';
          }
          if ((section.id === 'tachanun' || section.id === 'vidui') && settings.forceNoTachanun) {
            isOmitted = true;
            omitReason = 'הוגדר ידנית ללא תחנון';
          }

          if (isOmitted) {
            return (
              <section key={section.id} id={`section-${section.id}`} className="reader-section omitted-section">
                <details className="omitted-details">
                  <summary className="omitted-summary">
                    <span className="omitted-title">{section.title}</span>
                    <span className="omitted-reason">(לא אומרים: {omitReason})</span>
                  </summary>
                  <div className="omitted-content">
                    <ContentRenderer nodes={section.nodes} />
                  </div>
                </details>
              </section>
            );
          }

          return (
            <section key={section.id} id={`section-${section.id}`} className="reader-section">
              <h2 className="reader-section-title">{section.title}</h2>
              <ContentRenderer nodes={section.nodes} />
            </section>
          );
        })}
      </main>
    </div>
  );
}
