import { describe, expect, it } from 'vitest';

import {
  filterFullPageObjectResponses,
  isFullPageObjectResponse,
} from './pageGuards';

const fullPage = {
  object: 'page',
  id: 'full-page-id',
  url: 'https://www.notion.so/full-page-id',
  properties: {},
} as const;

const partialPage = {
  object: 'page',
  id: 'partial-page-id',
} as const;

describe('Notion page guards', () => {
  describe('isFullPageObjectResponse', () => {
    it.each([
      { result: fullPage, expected: true },
      { result: partialPage, expected: false },
    ])(
      'returns $expected when checking $result.id',
      ({ result, expected }) => {
        const sut = isFullPageObjectResponse;

        const isFullPageResult = sut(result);

        expect(isFullPageResult).toBe(expected);
      }
    );
  });

  describe('filterFullPageObjectResponses', () => {
    it('returns only full pages when query results include partial pages', () => {
      const sut = filterFullPageObjectResponses;
      const queryResults = [fullPage, partialPage];

      const filteredPages = sut(queryResults);

      expect(filteredPages).toEqual([fullPage]);
    });
  });
});
