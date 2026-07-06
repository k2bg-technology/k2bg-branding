import { describe, expect, it } from 'vitest';
import {
  buildCanonicalPath,
  buildPaginatedTitle,
  resolvePageParam,
} from './pagination';

describe('resolvePageParam', () => {
  it('returns the first page when the param is missing', () => {
    const firstPage = 1;

    expect(resolvePageParam(undefined)).toBe(firstPage);
  });

  it.each`
    pageParam | expected
    ${'1'}    | ${1}
    ${'2'}    | ${2}
    ${'10'}   | ${10}
  `(
    'returns $expected when the param is "$pageParam"',
    ({ pageParam, expected }) => {
      expect(resolvePageParam(pageParam)).toBe(expected);
    }
  );

  it('returns NaN when the param is not numeric so callers can reject it', () => {
    expect(resolvePageParam('abc')).toBeNaN();
  });
});

describe('buildCanonicalPath', () => {
  it.each`
    basePath              | page | expected
    ${'/blog'}            | ${1} | ${'/blog'}
    ${'/blog'}            | ${2} | ${'/blog?page=2'}
    ${'/category/DESIGN'} | ${1} | ${'/category/DESIGN'}
    ${'/category/DESIGN'} | ${3} | ${'/category/DESIGN?page=3'}
  `(
    'returns "$expected" for base "$basePath" on page $page',
    ({ basePath, page, expected }) => {
      expect(buildCanonicalPath(basePath, page)).toBe(expected);
    }
  );
});

describe('buildPaginatedTitle', () => {
  it.each`
    baseTitle   | page | expected
    ${'Blog'}   | ${1} | ${'Blog'}
    ${'Blog'}   | ${2} | ${'Blog | Page 2'}
    ${'DESIGN'} | ${5} | ${'DESIGN | Page 5'}
  `(
    'returns "$expected" for title "$baseTitle" on page $page',
    ({ baseTitle, page, expected }) => {
      expect(buildPaginatedTitle(baseTitle, page)).toBe(expected);
    }
  );
});
