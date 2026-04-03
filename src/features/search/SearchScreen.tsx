import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StandardHeader } from '../../shared/Header';
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
      <StandardHeader 
        title="" 
        showBack={true} 
      >
        <div style={{ flex: 1, padding: '0 var(--space-1)', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input 
            type="search" 
            className="search-input fade-in"
            placeholder={isReady ? "חיפוש בסידור ובתהילים..." : "טוען מאגר מילים..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!isReady}
            autoFocus
            style={{ 
              width: '100%',
              height: '40px',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              padding: '0 var(--space-4)',
              fontSize: 'var(--text-base)',
              background: 'var(--color-primary-dark, rgba(0,0,0,0.2))',
              color: 'white',
              outline: 'none',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
            }}
          />
          {query.length > 0 && (
            <button 
              onClick={() => setQuery('')}
              style={{
                position: 'absolute',
                left: 'var(--space-3)',
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </StandardHeader>
      
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
