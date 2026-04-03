import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { StandardHeader } from '../../shared/Header';
import { useContextStore, useTehillimStore } from '../../core/stores';
import './TehillimScreen.css';

// Tehillim book divisions
const BOOK_RANGES: Record<number, [number, number]> = {
  1: [1, 41],
  2: [42, 72],
  3: [73, 89],
  4: [90, 106],
  5: [107, 150],
};

const BOOK_NAMES = ['', 'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי'];

// Day of week mapping
const DOW_MAPPING: Record<number, number[]> = {
  0: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
  1: [30, 31, 32, 33, 34, 35],
  2: [36, 37, 38, 39, 40, 41, 42, 43],
  3: [44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54],
  4: [55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67],
  5: [68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82],
  6: [83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150],
};

const TIKKUN_KLALI = [16, 32, 41, 42, 59, 77, 90, 105, 137, 150];

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export function TehillimScreen() {
  const [activeTab, setActiveTab] = useState<'daily' | 'explorer'>('daily');
  const context = useContextStore((s) => s.context);
  const { favorites, lastReadChapter } = useTehillimStore();

  const dow = context?.dayOfWeek ?? new Date().getDay();
  const dayChapters = DOW_MAPPING[dow] ?? [];

  return (
    <div className="screen">
      <StandardHeader 
        title="תהילים" 
        rightElement={
          <Link to="/search" className="header-btn" aria-label="חיפוש">
            <Search size={22} />
          </Link>
        }
      />

      {/* Tabs */}
      <div className="tehillim-tabs">
        <button
          className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          יומי
        </button>
        <button
          className={`tab ${activeTab === 'explorer' ? 'active' : ''}`}
          onClick={() => setActiveTab('explorer')}
        >
          סייר
        </button>
      </div>

      <div className="container fade-in">
        {activeTab === 'daily' ? (
          <DailyTab dow={dow} dayChapters={dayChapters} favorites={favorites} lastReadChapter={lastReadChapter} />
        ) : (
          <ExplorerTab />
        )}
      </div>
    </div>
  );
}

function DailyTab({
  dow,
  dayChapters,
  favorites,
  lastReadChapter,
}: {
  dow: number;
  dayChapters: number[];
  favorites: number[];
  lastReadChapter: number | null;
}) {
  return (
    <div className="tehillim-daily">
      <button className="tehillim-action-btn card">
        <span className="action-emoji">🙏</span>
        <span>יהי רצון</span>
      </button>

      <Link to={`/tehillim/1`} className="tehillim-action-btn card">
        <span className="action-emoji">📖</span>
        <span>כל התהילים</span>
      </Link>

      <Link to={`/tehillim/${dayChapters[0] ?? 1}`} className="tehillim-action-btn card">
        <span className="action-emoji">📅</span>
        <span>תהילים ליום {DAYS_HE[dow]}</span>
        <span className="chapter-range">
          פרקים {dayChapters[0]}–{dayChapters[dayChapters.length - 1]}
        </span>
      </Link>

      {lastReadChapter && (
        <Link to={`/tehillim/${lastReadChapter}`} className="tehillim-action-btn card">
          <span className="action-emoji">🔖</span>
          <span>המשך קריאה (פרק {lastReadChapter})</span>
        </Link>
      )}

      {favorites.length > 0 && (
        <div className="favorites-section">
          <h3 className="section-title">הפרקים שלי</h3>
          {favorites.map((ch) => (
            <Link key={ch} to={`/tehillim/${ch}`} className="tehillim-action-btn card">
              <span className="action-emoji">⭐</span>
              <span>פרק {ch}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ExplorerTab() {
  return (
    <div className="tehillim-explorer">
      {Object.entries(BOOK_RANGES).map(([book, [from, to]]) => (
        <Link key={book} to={`/tehillim/${from}`} className="tehillim-action-btn card">
          <span className="action-emoji">📚</span>
          <span>ספר {BOOK_NAMES[Number(book)] ?? book} (פרקים {from}–{to})</span>
        </Link>
      ))}

      <Link to={`/tehillim/${TIKKUN_KLALI[0]}`} className="tehillim-action-btn card">
        <span className="action-emoji">✨</span>
        <span>התיקון הכללי</span>
        <span className="chapter-range">{TIKKUN_KLALI.join(', ')}</span>
      </Link>

      <Link to="/tehillim/23" className="tehillim-action-btn card">
        <span className="action-emoji">🕯️</span>
        <span>תהילים כ״ג — מזמור לדוד</span>
      </Link>

      <Link to="/tehillim/121" className="tehillim-action-btn card">
        <span className="action-emoji">🏔️</span>
        <span>תהילים קכ״א — שיר למעלות</span>
      </Link>

      <Link to="/tehillim/150" className="tehillim-action-btn card">
        <span className="action-emoji">🎶</span>
        <span>תהילים ק״נ — הללויה</span>
      </Link>
    </div>
  );
}
