import { describe, expect, it } from 'vitest';

import { AmbiguousSortKeyError } from '../errors';
import { resolveSortKey } from './resolveSortKey';

const context = { sectionId: 'bars', column: 'weekday' };
describe('resolveSortKey', () => {
  it('keeps unambiguous keys including null', () => {
    expect(resolveSortKey(3, 1, context)).toBe(3);
    expect(resolveSortKey(null, 0, context)).toBeNull();
  });
  it('rejects several distinct keys for one category', () => {
    expect(() => resolveSortKey(3, 2, context)).toThrow(AmbiguousSortKeyError);
  });
});
