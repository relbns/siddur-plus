import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Settings, ChevronDown } from 'lucide-react';
import { StandardHeader } from '../../shared/Header';
import type { PrayerDocument } from '../../core/types';
import { useContextStore, useSettingsStore } from '../../core/stores';
import { ContentRenderer } from '../../shared/ContentRenderer';
import './PrayerReader.css';

export function PrayerReader() {
  const { prayerId } = useParams<{ prayerId: string }>();
  const navigate = useNavigate();
  const { lockSession, unlockSession, context } = useContextStore();
  const settings = useSettingsStore();
  
  const [document, setDocument] = useState<PrayerDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);

  // Lock session on mount, unlock on unmount
  useEffect(() => {
    lockSession();
    return () => unlockSession();
  }, [lockSession, unlockSession]);

  // Load prayer document
  useEffect(() => {
    async function loadPrayer() {
      try {
        const nusach = settings.nusach || 'sefard';
        const res = await fetch(`/data/prayer-${prayerId}-${nusach}.json`);
        if (res.ok) {
          const data: PrayerDocument = await res.json();
          setDocument(data);
          if (data.sections.length > 0) {
            setActiveSection(data.sections[0]?.id ?? null);
          }
        }
      } catch (err) {
        console.error('Failed to load prayer:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPrayer();
  }, [prayerId, settings.nusach]);

  const handleBack = useCallback(() => {
    navigate('/siddur');
  }, [navigate]);

  const scrollToSection = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    const el = globalThis.document.getElementById(`section-${sectionId}`);
    if (el) {
      // Offset for header (56px) + section picker (48px)
      const offset = 104;
      const bodyRect = globalThis.document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  const activeSectionTitle = useMemo(() => {
    return document?.sections.find(s => s.id === activeSection)?.title || 'בחר חלק...';
  }, [document, activeSection]);

  if (loading) {
    return (
      <div className="reader-loading">
        <span>טוען תפילה...</span>
      </div>
    );
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
    <div className="prayer-reader" onClick={() => { if (showSettings) setShowSettings(false); }}>
      <StandardHeader 
        title={document.title} 
        showBack={true} 
        onBack={handleBack}
        rightElement={
          <button 
            className="header-btn" 
            onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
            aria-label="הגדרות תפילה"
          >
            <Settings size={22} />
          </button>
        }
      >
        {showSettings && (
          <div className="prayer-settings-dropdown card fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="settings-title">בחר מצב תפילה</h3>
            
            <label className="settings-radio">
              <input 
                type="radio" 
                name="prayerMode" 
                checked={settings.prayerMode === 'regular'} 
                onChange={() => settings.updateSetting('prayerMode', 'regular')} 
              />
              מצב רגיל
            </label>
            <label className="settings-radio">
              <input 
                type="radio" 
                name="prayerMode" 
                checked={settings.prayerMode === 'chazan'} 
                onChange={() => settings.updateSetting('prayerMode', 'chazan')} 
              />
              מצב חזן
            </label>
            <label className="settings-radio">
              <input 
                type="radio" 
                name="prayerMode" 
                checked={settings.prayerMode === 'yachid'} 
                onChange={() => settings.updateSetting('prayerMode', 'yachid')} 
              />
              מצב יחיד
            </label>
            
            <h3 className="settings-title" style={{ marginTop: 'var(--space-3)' }}>אירועים מיוחדים</h3>
            
            <label className="settings-checkbox">
              <input 
                type="checkbox" 
                checked={settings.isMournerHouse} 
                onChange={(e) => settings.updateSetting('isMournerHouse', e.target.checked)} 
              />
              בית אבל
            </label>
            <label className="settings-checkbox">
              <input 
                type="checkbox" 
                checked={settings.forceNoTachanun} 
                onChange={(e) => settings.updateSetting('forceNoTachanun', e.target.checked)} 
              />
              ללא תחנון
            </label>
          </div>
        )}
      </StandardHeader>

      {/* Section Dropdown (Sticky below header) */}
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
                  onClick={() => {
                    scrollToSection(s.id);
                    setShowSectionMenu(false);
                  }}
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
