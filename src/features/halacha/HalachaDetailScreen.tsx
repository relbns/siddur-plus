import { useParams } from 'react-router-dom';
import { StandardHeader } from '../../shared/Header';
import { useHalachaFeed } from './useHalachaFeed';

export function HalachaDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const feed = useHalachaFeed();
  
  const halacha = feed.find(h => h.id === id);

  if (!halacha) {
    return (
      <div className="screen">
        <StandardHeader title="הלכה לא נמצאה" showBack={true} />
        <div className="container" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
          ההלכה שחיפשת אינה קיימת או שאינה קיימת בהקשר של היום.
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <StandardHeader title={halacha.title} showBack={true} />
      
      <main className="container fade-in" style={{ padding: 'var(--space-4) 0' }}>
        <article style={{ background: 'var(--color-surface)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
          {halacha.priority === 1 && (
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <span style={{
                padding: '2px 8px',
                background: 'var(--color-accent)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
              }}>
                🔥 רלוונטי במיוחד להיום
              </span>
            </div>
          )}
          
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>
            {halacha.title}
          </h2>
          
          <p style={{ 
            fontSize: 'var(--text-md)', 
            lineHeight: 1.6, 
            whiteSpace: 'pre-wrap',
            color: 'var(--color-text)'
          }}>
            {halacha.contentHe}
          </p>
        </article>
      </main>
    </div>
  );
}
