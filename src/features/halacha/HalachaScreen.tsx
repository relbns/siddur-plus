import { useContextStore } from '../../core/stores';

export function HalachaScreen() {
  const context = useContextStore((s) => s.context);

  // Sample contextual halachot (will be replaced with JSON data)
  const halachot = getContextualHalachot(context);

  return (
    <div className="screen">
      <header className="app-header">
        <h1>הלכה</h1>
      </header>
      <div className="container fade-in" style={{ paddingTop: 'var(--space-4)' }}>
        <h2 className="section-title">הלכות רלוונטיות להיום</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {halachot.map((h) => (
            <article key={h.id} className="card" style={{ cursor: 'pointer' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
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
                }}>
                  רלוונטי במיוחד
                </span>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SimpleHalacha {
  id: string;
  title: string;
  summary: string;
  priority: 1 | 2 | 3;
}

function getContextualHalachot(context: ReturnType<typeof useContextStore.getState>['context']): SimpleHalacha[] {
  const items: SimpleHalacha[] = [];

  if (!context) return [{ id: 'loading', title: 'טוען...', summary: '', priority: 3 }];

  if (context.isPesach || context.isCholHamoed) {
    items.push({
      id: 'pesach-chametz',
      title: 'איסור חמץ',
      summary: 'בחג הפסח ובחול המועד אסור לאכול ולהחזיק חמץ. יש להקפיד על מאכלים כשרים לפסח בלבד.',
      priority: 1,
    });
  }

  if (!context.tefillinAllowed) {
    items.push({
      id: 'no-tefillin',
      title: 'לא מניחים תפילין',
      summary: context.isShabbat
        ? 'בשבת קודש אין מניחים תפילין.'
        : context.isCholHamoed
        ? 'בחול המועד (במנהג ארץ ישראל) לא מניחים תפילין.'
        : 'ביום טוב אין מניחים תפילין.',
      priority: 1,
    });
  }

  if (!context.tachanunAllowed) {
    items.push({
      id: 'no-tachanun',
      title: 'לא אומרים תחנון',
      summary: 'ביום זה לא אומרים תחנון בתפילה.',
      priority: 2,
    });
  }

  if (context.isErevShabbat) {
    items.push({
      id: 'erev-shabbat',
      title: 'הכנות לשבת',
      summary: 'יש להכין את צרכי השבת מבעוד מועד. הדלקת נרות לפני השקיעה.',
      priority: 1,
    });
  }

  if (context.sefiraDayHe) {
    items.push({
      id: 'sefirat-haomer',
      title: `ספירת העומר — ${context.sefiraDayHe}`,
      summary: 'בימי הספירה נוהגים מנהגי אבלות: לא מסתפרים, לא עורכים חתונות (לפי מנהגים).',
      priority: 2,
    });
  }

  // Always add a general daily item
  items.push({
    id: 'morning-brachot',
    title: 'ברכות השחר',
    summary: 'כל יום יש לברך את ברכות השחר כראוי, בשם ומלכות.',
    priority: 3,
  });

  return items.sort((a, b) => a.priority - b.priority);
}
