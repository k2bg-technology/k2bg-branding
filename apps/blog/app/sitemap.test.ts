import { afterEach, describe, expect, it, vi } from 'vitest';

import type { SlugOutput } from '../modules/post/use-cases';

const configuredBaseUrl = 'https://blog.example.com';
const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));

vi.mock('../infrastructure/di', () => ({
  createFetchAllSlugsUseCase: () => ({ execute }),
}));

async function importSitemap() {
  vi.resetModules();
  vi.stubEnv('BLOG_SITE_BASE_URL', configuredBaseUrl);
  return import('./sitemap');
}

const slugs: SlugOutput[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    slug: 'first-post',
    revisionDate: '2024-01-15',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    slug: 'second-post',
    revisionDate: '2024-03-20',
  },
];

describe('sitemap', () => {
  afterEach(() => {
    execute.mockReset();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('uses each article revision date as its last modified date', async () => {
    execute.mockResolvedValue({ slugs });
    const { default: sut } = await importSitemap();

    const entries = await sut();

    const articleEntries = entries.filter((entry) =>
      entry.url.startsWith(`${configuredBaseUrl}/blog/`)
    );
    expect(articleEntries.map((entry) => entry.lastModified)).toEqual([
      new Date('2024-01-15'),
      new Date('2024-03-20'),
    ]);
  });

  it('uses the newest article revision date for static and category entries', async () => {
    execute.mockResolvedValue({ slugs });
    const { default: sut } = await importSitemap();

    const entries = await sut();

    const articleUrls = slugs.map(
      (slug) => `${configuredBaseUrl}/blog/${slug.id}/${slug.slug}`
    );
    const staticAndCategoryEntries = entries.filter(
      (entry) => !articleUrls.includes(entry.url)
    );
    expect(staticAndCategoryEntries.map((entry) => entry.lastModified)).toEqual(
      Array.from(
        { length: staticAndCategoryEntries.length },
        () => new Date('2024-03-20')
      )
    );
  });

  it('does not include the search page', async () => {
    execute.mockResolvedValue({ slugs });
    const { default: sut } = await importSitemap();

    const entries = await sut();

    expect(entries.map((entry) => entry.url)).not.toContain(
      `${configuredBaseUrl}/search`
    );
  });

  it('returns static and category entries without last modified dates when no articles exist', async () => {
    execute.mockResolvedValue({ slugs: [] });
    const { default: sut } = await importSitemap();
    const expectedUrls = [
      `${configuredBaseUrl}/blog`,
      `${configuredBaseUrl}/contact`,
      `${configuredBaseUrl}/concept`,
      `${configuredBaseUrl}/category/ENGINEERING`,
      `${configuredBaseUrl}/category/DESIGN`,
      `${configuredBaseUrl}/category/DATA_SCIENCE`,
      `${configuredBaseUrl}/category/LIFE_STYLE`,
    ];

    const entries = await sut();

    expect(entries.map((entry) => entry.url)).toEqual(expectedUrls);
    expect(entries.every((entry) => entry.lastModified === undefined)).toBe(
      true
    );
  });

  it('returns only static entries without last modified dates when fetching slugs fails', async () => {
    execute.mockRejectedValue(new Error('Failed to fetch slugs'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { default: sut } = await importSitemap();

    const entries = await sut();

    expect(entries).toEqual([
      {
        url: `${configuredBaseUrl}/blog`,
        changeFrequency: 'weekly',
        priority: 1,
      },
      {
        url: `${configuredBaseUrl}/contact`,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${configuredBaseUrl}/concept`,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
    ]);
  });

  it('includes exactly the four listed category pages', async () => {
    execute.mockResolvedValue({ slugs });
    const { default: sut } = await importSitemap();

    const entries = await sut();

    const categoryUrls = entries
      .map((entry) => entry.url)
      .filter((url) => url.startsWith(`${configuredBaseUrl}/category/`));
    expect(categoryUrls).toEqual([
      `${configuredBaseUrl}/category/ENGINEERING`,
      `${configuredBaseUrl}/category/DESIGN`,
      `${configuredBaseUrl}/category/DATA_SCIENCE`,
      `${configuredBaseUrl}/category/LIFE_STYLE`,
    ]);
    expect(categoryUrls).not.toContain(`${configuredBaseUrl}/category/OTHER`);
  });
});
