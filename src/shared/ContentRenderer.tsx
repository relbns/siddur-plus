import type { ContentNode } from '../core/types';
import { evaluatePredicate } from '../core/evaluator';
import { useContextStore, useSettingsStore } from '../core/stores';
import type { AppContext, UserSettings } from '../core/types';
import './ContentRenderer.css';

interface ContentRendererProps {
  nodes: ContentNode[];
}

/**
 * Renders an array of ContentNodes, evaluating predicate conditions
 * against the current AppContext flags. This is the core rendering
 * engine — zero logic in UI, all condition-driven.
 */
export function ContentRenderer({ nodes }: ContentRendererProps) {
  const context = useContextStore((s: { lockedContext: AppContext | null; context: AppContext | null }) => s.lockedContext ?? s.context);
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
              <p key={node.id} className="instruction-text" id={node.id}>
                {text}
              </p>
            );
          case 'text':
            return (
              <div key={node.id} className="prayer-text-block" id={node.id}>
                {text.split('\n').map((line: string, i: number) => (
                  <p key={i} className="prayer-text">
                    {line}
                  </p>
                ))}
              </div>
            );
          case 'group':
            return (
              <div key={node.id} className="content-group" id={node.id}>
                {node.children && (
                  <ContentRenderer nodes={node.children} />
                )}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
