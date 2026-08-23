// Series ids are public input; namespacing them keeps a series from
// overwriting the row's own axis field (`timestamp` / `category`).
const seriesDataKeyPrefix = 'series:';

export function seriesDataKey(seriesId: string): string {
  return `${seriesDataKeyPrefix}${seriesId}`;
}
