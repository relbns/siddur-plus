import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSettingsStore, useTehillimStore } from '../../core/stores';
import type { TehillimChapter, UserSettings } from '../../core/types';
import { usePrayerMode } from '../../shared/usePrayerMode';
import './TehillimReader.css';

/** Gematriya converter for chapter numbers */
function toGematriya(n: number): string {
  const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  const hundreds = ['', 'ק', 'ר', 'ש', 'ת'];

  if (n === 15) return 'ט״ו';
  if (n === 16) return 'ט״ז';

  let result = '';
  if (n >= 100) {
    result += hundreds[Math.floor(n / 100)] ?? '';
    n %= 100;
  }
  if (n >= 10) {
    result += tens[Math.floor(n / 10)] ?? '';
    n %= 10;
  }
  if (n > 0) {
    result += ones[n] ?? '';
  }

  // Insert gershayim before last char
  if (result.length > 1) {
    result = result.slice(0, -1) + '״' + result.slice(-1);
  } else if (result.length === 1) {
    result += '׳';
  }

  return result;
}

export function TehillimReader() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const showNikud = useSettingsStore((s: UserSettings) => s.showNikud);
  const { markChapterRead, isRead } = useTehillimStore();
  const [chapter, setChapter] = useState<TehillimChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [allChapters, setAllChapters] = useState<TehillimChapter[]>([]);

  const { showDndToast } = usePrayerMode();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('./data/tehillim.json');
        if (res.ok) {
          const data: TehillimChapter[] = await res.json();
          setAllChapters(data);
          const num = parseInt(chapterId ?? '1', 10);
          const ch = data.find((c) => c.number === num);
          setChapter(ch ?? null);
          // Mark as read
          if (ch) {
            markChapterRead(ch.number);
          }
        }
      } catch (err) {
        console.error('Failed to load Tehillim:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [chapterId, markChapterRead]);

  const goToChapter = useCallback(
    (num: number) => {
      navigate(`/tehillim/${num}`, { replace: true });
    },
    [navigate]
  );

  if (loading) {
    return <div className="reader-loading">טוען...</div>;
  }

  if (!chapter) {
    return (
      <div className="reader-loading">
        <span>פרק לא נמצא</span>
        <button className="btn btn-primary" onClick={() => navigate('/tehillim')} style={{ marginTop: 'var(--space-4)' }}>
          חזרה לתהילים
        </button>
      </div>
    );
  }

  const text = showNikud ? chapter.contentHe : chapter.contentHeClean;
  const verses = text.split('\n');

  // Find prev/next chapters in available data
  const currentIndex = allChapters.findIndex((c) => c.number === chapter.number);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  return (
    <div className="tehillim-reader">
      {/* Header */}
      <header className="reader-header">
        <button className="reader-back-btn" onClick={() => navigate('/tehillim')} aria-label="חזרה">
          ←
        </button>
        <h1>תהילים פרק {toGematriya(chapter.number)}</h1>
        <div style={{ width: '2rem' }} />
      </header>

      {/* Content */}
      <main className="reader-content container">
        <div className="tehillim-chapter-body">
          {verses.map((verse, i) => (
            <p key={i} className="prayer-text tehillim-verse">
              <span className="verse-num">{toGematriya(i + 1)}</span>
              {verse}
            </p>
          ))}
        </div>

        {/* Chapter read marker */}
        {isRead(chapter.number) && (
          <div className="chapter-read-badge">✓ קראת פרק זה</div>
        )}

        {/* Navigation */}
        <nav className="chapter-nav">
          {prevChapter && (
            <button className="btn btn-outline" onClick={() => goToChapter(prevChapter.number)}>
              פרק {toGematriya(prevChapter.number)} ←
            </button>
          )}
          {nextChapter && (
            <button className="btn btn-primary" onClick={() => goToChapter(nextChapter.number)}>
              → פרק {toGematriya(nextChapter.number)}
            </button>
          )}
        </nav>
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
