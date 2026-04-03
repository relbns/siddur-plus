import { Link } from 'react-router-dom';
import { StandardHeader } from '../../shared/Header';
import { useHalachaFeed } from './useHalachaFeed';

export function HalachaScreen() {
  const halachot = useHalachaFeed();

  return (
    <div className="screen">
      <StandardHeader title="הלכה" />
      <div className="container fade-in" style={{ paddingTop: 'var(--space-4)' }}>
        <h2 className="section-title">הלכות רלוונטיות להיום</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {halachot.map((h) => (
            <Link key={h.id} to={`/halacha/${h.id}`} className="card" style={{ display: 'block', textDecoration: 'none' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                {h.title}
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {h.summary}
              </p>
              {h.priority === 1 && (
                <span style={{
                  display: 'inline-block',
                  marginTop: 'var(--space-2)',
                  padding: '2px 8px',
                  background: 'var(--color-accent)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: '#fff'
                }}>
                  רלוונטי במיוחד
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
