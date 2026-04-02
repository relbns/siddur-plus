import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchEngine, SearchResult } from './search-engine';
import './SearchScreen.css';

export function SearchScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Warm up the engine
    searchEngine.ensureLoaded().then(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (isReady && query.length > 2) {
      const timeout = setTimeout(() => {
        setResults(searchEngine.search(query));
      }, 200);
      return () => clearTimeout(timeout);
    } else {
      setResults([]);
    }
  }, [query, isReady]);

  return (
    <div className="screen">
      <header className="app-header">
        <button className="reader-back-btn" onClick={() => navigate(-1)} aria-label="חזרה">←</button>
        <div style={{ flex: 1 }}>
          <input 
            type="search" 
            className="search-input fade-in"
            placeholder={isReady ? "חיפוש בסידור ובתהילים..." : "טוען מאגר מילים..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!isReady}
            autoFocus
          />
        </div>
      </header>
      
      <main className="container" style={{ paddingTop: 'var(--space-4)', paddingBottom: 'calc(var(--nav-height) + var(--space-4))' }}>
        {results.length > 0 ? (
          <ul className="search-results fade-in">
            {results.map((res) => (
              <li key={res.id} className="search-result-item" onClick={() => navigate(res.route)}>
                <div className="result-header">
                  <span className="result-tag">{res.type === 'prayer' ? 'תפילה' : 'תהילים'}</span>
                  <span className="result-title">{res.title}</span>
                </div>
                <p className="result-preview">{res.preview}</p>
              </li>
            ))}
          </ul>
        ) : query.length > 2 ? (
          <div className="search-empty fade-in">
            <p>לא נמצאו תוצאות עבור החיפוש.</p>
          </div>
        ) : (
          <div className="search-empty fade-in">
            <p>הזן לפחות 3 תוויות לחיפוש טקסט בתפילות ובתהילים.</p>
          </div>
        )}
      </main>
    </div>
  );
}
