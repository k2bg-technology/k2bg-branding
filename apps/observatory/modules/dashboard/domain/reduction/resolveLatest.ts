import { AmbiguousLatestValueError } from '../errors';

export interface LatestValueContext {
  sectionId: string;
  column: string;
}

export function resolveLatest(
  value: number | null,
  distinctValueCount: number,
  context: LatestValueContext
): number | null {
  if (distinctValueCount > 1) {
    throw new AmbiguousLatestValueError(context.sectionId, context.column);
  }
  return value;
}
