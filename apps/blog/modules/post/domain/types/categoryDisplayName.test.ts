import { describe, expect, it } from 'vitest';

import { getCategoryDisplayName } from './categoryDisplayName';
import { Category } from './enums';

describe('getCategoryDisplayName', () => {
  it.each([
    [Category.ENGINEERING, 'Engineering'],
    [Category.DESIGN, 'Design'],
    [Category.DATA_SCIENCE, 'Data Science'],
    [Category.LIFE_STYLE, 'Life Style'],
    [Category.OTHER, 'Other'],
  ])('returns %s display name as %s', (category, expectedDisplayName) => {
    const sut = getCategoryDisplayName;

    const result = sut(category);

    expect(result).toBe(expectedDisplayName);
  });
});
