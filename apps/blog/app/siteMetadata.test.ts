import { describe, expect, it } from 'vitest';

import { Category } from '../modules/post/domain';
import {
  BLOG_CATEGORY_DESCRIPTIONS,
  isListedCategory,
  LISTED_CATEGORIES,
} from './siteMetadata';

describe('siteMetadata', () => {
  it.each(LISTED_CATEGORIES)(
    'recognizes %s as a listed category',
    (category) => {
      const sut = isListedCategory;

      const result = sut(category);

      expect(result).toBe(true);
    }
  );

  it.each([Category.OTHER, 'UNRECOGNIZED'])(
    'does not recognize %s as a listed category',
    (category) => {
      const sut = isListedCategory;

      const result = sut(category);

      expect(result).toBe(false);
    }
  );

  it.each(LISTED_CATEGORIES)(
    'provides a non-empty description for %s',
    (category) => {
      const sut = BLOG_CATEGORY_DESCRIPTIONS;

      const result = sut[category];

      expect(result).not.toHaveLength(0);
    }
  );
});
