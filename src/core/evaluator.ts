import type { Predicate } from './types';

/**
 * Evaluates a Predicate condition tree against a flat flags array.
 * This is the heart of the Content Engine — zero logic in UI.
 */
export function evaluatePredicate(
  predicate: Predicate | undefined,
  flags: string[]
): boolean {
  if (predicate === undefined) return true;

  if (typeof predicate === 'string') {
    return flags.includes(predicate);
  }

  if ('and' in predicate) {
    return predicate.and.every((p) => evaluatePredicate(p, flags));
  }

  if ('or' in predicate) {
    return predicate.or.some((p) => evaluatePredicate(p, flags));
  }

  if ('not' in predicate) {
    return !evaluatePredicate(predicate.not, flags);
  }

  return true;
}
