import { AmbiguousSortKeyError } from '../errors';
import type { SortKeyValue } from '../presentation/categoryValue';

export function resolveSortKey(
  value: SortKeyValue,
  distinctValueCount: number,
  context: { sectionId: string; column: string }
): SortKeyValue {
  if (distinctValueCount > 1) {
    throw new AmbiguousSortKeyError(context.sectionId, context.column);
  }
  return value;
}
