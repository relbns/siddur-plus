import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StandardHeader } from '../../shared/Header';
import { useSettingsStore, useTehillimStore } from '../../core/stores';
import type { TehillimChapter, UserSettings } from '../../core/types';
import './TehillimReader.css';

/** Gematriya converter for chapter numbers */
function toGematriya(n: number): string {
  if (n <= 0) return '';
  const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  const hundreds = ['', 'ק', 'ר', 'ש', 'ת'];

  let num = n;
  if (num === 15) return 'ט״ו';
  if (num === 16) return 'ט״ז';

  let result = '';
  if (num >= 100) { result += hundreds[Math.floor(num / 100)] ?? ''; num %= 100; }
  if (num >= 10) { result += tens[Math.floor(num / 10)] ?? ''; num %= 10; }
  if (num > 0) { result += ones[num] ?? ''; }

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

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/data/tehillim.json');
        if (res.ok) {
          const data: TehillimChapter[] = await res.json();
          setAllChapters(data);
          const num = parseInt(chapterId ?? '1', 10);
          const ch = data.find((c) => c.number === num);
          setChapter(ch ?? null);
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

  const { verses, prevChapter, nextChapter } = useMemo(() => {
    if (!chapter || !allChapters.length) return { verses: [], prevChapter: null, nextChapter: null };
    
    const text = showNikud ? chapter.contentHe : chapter.contentHeClean;
    const v = text.split('\n');

    const currentIndex = allChapters.findIndex((c) => c.number === chapter.number);
    const prev = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
    const next = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

    return { verses: v, prevChapter: prev, nextChapter: next };
  }, [chapter, allChapters, showNikud]);

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

  return (
    <div className="tehillim-reader">
      <StandardHeader title={`תהילים פרק ${toGematriya(chapter.number)}`} showBack={true} backTo="/tehillim" />

      <main className="reader-content container fade-in">
        <div className="tehillim-chapter-body">
          {verses.map((verse, i) => (
            <p key={i} className="prayer-text tehillim-verse">
              <span className="verse-num">{toGematriya(i + 1)}</span>
              <span dangerouslySetInnerHTML={{ __html: verse }} />
            </p>
          ))}
        </div>

        {isRead(chapter.number) && (
          <div className="chapter-read-badge">✓ קראת פרק זה</div>
        )}

        <nav className="chapter-nav">
          {prevChapter && (
            <button className="btn btn-outline" onClick={() => goToChapter(prevChapter.number)}>
               ← פרק {toGematriya(prevChapter.number)}
            </button>
          )}
          {nextChapter && (
            <button className="btn btn-primary" onClick={() => goToChapter(nextChapter.number)}>
              פרק {toGematriya(nextChapter.number)} →
            </button>
          )}
        </nav>
      </main>
    </div>
  );
}
