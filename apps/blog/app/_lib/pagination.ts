const FIRST_PAGE = 1;

/**
 * Resolves the `page` search param into a page number. A missing param defaults
 * to the first page; any other value passes through as-is so the use case can
 * reject out-of-range or malformed input.
 */
export function resolvePageParam(pageParam: string | undefined): number {
  if (pageParam === undefined) {
    return FIRST_PAGE;
  }
  return Number(pageParam);
}

/**
 * Builds a self-referencing canonical path. The first page canonicalizes to the
 * base path; later pages to `${basePath}?page=${page}`.
 *
 * @see https://developers.google.com/search/blog/2011/09/pagination-with-relnext-and-relprev
 */
export function buildCanonicalPath(basePath: string, page: number): string {
  return page > FIRST_PAGE ? `${basePath}?page=${page}` : basePath;
}

/**
 * Appends a " | Page N" suffix for pages after the first so paginated pages
 * carry distinct titles.
 */
export function buildPaginatedTitle(baseTitle: string, page: number): string {
  return page > FIRST_PAGE ? `${baseTitle} | Page ${page}` : baseTitle;
}
