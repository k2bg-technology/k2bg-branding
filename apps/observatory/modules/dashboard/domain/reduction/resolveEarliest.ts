import { AmbiguousEarliestValueError } from '../errors';

interface EarliestValueContext {
  sectionId: string;
  column: string;
}

export function resolveEarliest(
  value: number | null,
  distinctValueCount: number,
  context: EarliestValueContext
): number | null {
  if (distinctValueCount > 1) {
    throw new AmbiguousEarliestValueError(context.sectionId, context.column);
  }
  return value;
}
