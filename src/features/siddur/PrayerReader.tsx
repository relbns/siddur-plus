import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { PrayerDocument } from '../../core/types';
import { useContextStore } from '../../core/stores';
import { ContentRenderer } from '../../shared/ContentRenderer';
import { usePrayerMode } from '../../shared/usePrayerMode';
import './PrayerReader.css';

export function PrayerReader() {
  const { prayerId } = useParams<{ prayerId: string }>();
  const navigate = useNavigate();
  const { lockSession, unlockSession } = useContextStore();
  const [document, setDocument] = useState<PrayerDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  const { showDndToast } = usePrayerMode();

  // Lock session on mount, unlock on unmount
  useEffect(() => {
    lockSession();
    return () => unlockSession();
  }, [lockSession, unlockSession]);

  // Load prayer document
  useEffect(() => {
    async function loadPrayer() {
      try {
        const nusach = 'sefard'; // TODO: from settings
        const res = await fetch(`./data/prayer-${prayerId}-${nusach}.json`);
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
  }, [prayerId]);

  const handleBack = useCallback(() => {
    navigate('/siddur');
  }, [navigate]);

  const scrollToSection = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    const el = globalThis.document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

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
    <div className="prayer-reader">
      {/* Header */}
      <header className="reader-header">
        <button className="reader-back-btn" onClick={handleBack} aria-label="חזרה">
          ←
        </button>
        <h1>{document.title}</h1>
        <div style={{ width: '2rem' }} />
      </header>

      {/* Section nav chips */}
      <nav className="section-nav" aria-label="חלקי התפילה">
        {document.sections.map((s) => (
          <button
            key={s.id}
            className={`section-chip ${activeSection === s.id ? 'active' : ''}`}
            onClick={() => scrollToSection(s.id)}
          >
            {s.title}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="reader-content container">
        {document.sections.map((section) => (
          <section key={section.id} id={`section-${section.id}`} className="reader-section">
            <h2 className="reader-section-title">{section.title}</h2>
            <ContentRenderer nodes={section.nodes} />
          </section>
        ))}
      </main>

      {/* DND Toast */}
      {showDndToast && (
        <div className="toast fade-in" style={{ bottom: 'var(--space-4)' }}>
          🔕 אנא ודא שהמכשיר מוגדר על מצב שקט
        </div>
      )}
    </div>
  );
}
