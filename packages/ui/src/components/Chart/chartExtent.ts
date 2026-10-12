export interface NumericExtent {
  minimum: number;
  maximum: number;
}

/**
 * Smallest and largest of the values, or undefined when there are none. The
 * values are scanned rather than spread into `Math.min`, whose argument count
 * the engine caps well below the size of a long measured series.
 */
export function numericExtent(
  values: readonly number[]
): NumericExtent | undefined {
  return values.reduce<NumericExtent | undefined>(
    (extent, value) =>
      extent === undefined
        ? { minimum: value, maximum: value }
        : {
            minimum: Math.min(extent.minimum, value),
            maximum: Math.max(extent.maximum, value),
          },
    undefined
  );
}
