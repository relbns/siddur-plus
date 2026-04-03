import type { ContentNode, ZmanimSet } from '../core/types';
import { evaluatePredicate } from '../core/evaluator';
import { useContextStore, useSettingsStore } from '../core/stores';
import type { AppContext, UserSettings } from '../core/types';
import './ContentRenderer.css';

interface ContentRendererProps {
  nodes: ContentNode[];
}

/**
 * Renders an array of ContentNodes, evaluating predicate conditions
 * against the current AppContext flags. Zero logic in UI — all condition-driven.
 */

// Phrases that change based on season/calendar — highlighted in teal
const VARIABLE_TEXTS = [
  'מוריד הטל',
  'משיב הרוח ומוריד הגשם',
  'ברך עלינו',
  'ברכנו',
  'יעלה ויבוא',
  'על הניסים',
  'ותן טל ומטר לברכה',
  'ותן ברכה',
  'המלך המשפט',
  'המלך הקדוש',
  'זכרנו לחיים',
  'מי כמוך אב הרחמן',
  'ובספר חיים',
];

// Zman key → Hebrew label mapping
const ZMAN_LABELS: Partial<Record<keyof ZmanimSet, string>> = {
  sunrise: 'הנץ החמה',
  sunset: 'שקיעת החמה',
  tzeitHakochavim: 'צאת הכוכבים',
  chatzot: 'חצות היום',
  minchaGedola: 'מנחה גדולה',
  sofZmanShma: 'סוף זמן ק״ש',
  alotHashachar: 'עלות השחר',
};

function processText(text: string): string {
  let processed = text;

  // Highlight variable prayer phrases in teal
  for (const v of VARIABLE_TEXTS) {
    processed = processed.replace(
      new RegExp(`(${v})`, 'g'),
      '<span class="prayer-variable">$1</span>'
    );
  }

  // Handle <small> instructions
  processed = processed.replace(/<small>([\s\S]*?)($|<\/small>)/g, (_match, inner) => {
    const cleanInner = inner.replace(/<[^>]*>?/gm, '').trim();
    const textLen = cleanInner.length;
    if (textLen > 60) {
      const snippet = cleanInner.slice(0, 35) + '...';
      return `<details class="instruction-details"><summary>${snippet}</summary><div class="instruction-content">${inner}</div></details>`;
    }
    return `<small class="instruction-inline">${inner}</small>`;
  });

  return processed;
}

function formatZmanTime(date: Date | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function ContentRenderer({ nodes }: ContentRendererProps) {
  const context = useContextStore(
    (s: { lockedContext: AppContext | null; context: AppContext | null }) => s.lockedContext ?? s.context
  );
  const showNikud = useSettingsStore((s: UserSettings) => s.showNikud);
  const flags = context?.flags ?? [];

  return (
    <div className="content-renderer">
      {nodes.map((node) => {
        // Evaluate render condition
        if (!evaluatePredicate(node.renderCondition, flags)) {
          return null;
        }

        const text = showNikud ? node.contentHe : node.contentHeClean;

        switch (node.type) {
          case 'heading':
            return (
              <h3 key={node.id} className="heading-prayer" id={node.id}>
                {text}
              </h3>
            );

          case 'instruction':
            return (
              <div key={node.id} className="instruction-block" id={node.id}>
                <span className="instruction-marker">▸</span>
                <p className="instruction-text">{text}</p>
              </div>
            );

          case 'zman-marker': {
            const zmanKey = node.zmanKey;
            const zmanTime = zmanKey && context?.zmanim ? context.zmanim[zmanKey] : null;
            const label = (zmanKey && ZMAN_LABELS[zmanKey]) ?? node.contentHeClean;
            return (
              <div key={node.id} className="zman-marker-block" id={node.id}>
                <span className="zman-marker-label">{label}</span>
                <span className="zman-marker-time">{formatZmanTime(zmanTime as Date | null)}</span>
              </div>
            );
          }

          case 'text': {
            const isKaddish = node.contentHe.trim().startsWith('יִתְגַּדַּל וְיִתְקַדַּשׁ');
            const prevNode = nodes[nodes.indexOf(node) - 1];
            const needsKaddishHeader =
              isKaddish && prevNode?.type !== 'heading' && !prevNode?.contentHe.includes('קדיש');

            return (
              <div key={node.id} className="prayer-text-block" id={node.id}>
                {needsKaddishHeader && (
                  <h3 className="heading-kaddish">קדיש:</h3>
                )}
                {text.split('\n').map((line: string, i: number) => (
                  <p
                    key={i}
                    className="prayer-text"
                    dangerouslySetInnerHTML={{ __html: processText(line) }}
                  />
                ))}
              </div>
            );
          }

          case 'group':
            return (
              <div key={node.id} className="content-group" id={node.id}>
                {node.children && <ContentRenderer nodes={node.children} />}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
