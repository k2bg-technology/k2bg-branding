import { describe, expect, it, vi } from 'vitest';

import { BLOG_SITE_NAME } from '../siteMetadata';

import { metadata } from './page';

const { defaultOgImageUrl } = vi.hoisted(() => ({
  defaultOgImageUrl: 'https://example.com/og.png',
}));

vi.mock('../../infrastructure/di', () => ({
  getDefaultOgImageUrl: () => defaultOgImageUrl,
  createFetchPostUseCase: vi.fn(),
}));

const expectedTitle = 'コンセプトページ';
const expectedDescription = `${BLOG_SITE_NAME} のコンセプトを紹介します。`;

describe('concept page metadata', () => {
  it('titles the page after the concept it presents', () => {
    const result = metadata.title;

    expect(result).toBe(expectedTitle);
  });

  it('describes the page as an introduction to the site concept', () => {
    const result = metadata.description;

    expect(result).toBe(expectedDescription);
  });

  it('attributes the shared page to the site over Open Graph', () => {
    const expectedOpenGraph = {
      siteName: BLOG_SITE_NAME,
      description: expectedDescription,
    };

    const result = metadata.openGraph;

    expect(result).toMatchObject(expectedOpenGraph);
  });

  it('reuses the page description on Twitter cards', () => {
    const result = metadata.twitter?.description;

    expect(result).toBe(expectedDescription);
  });

  it('declares the concept page as its own canonical URL', () => {
    const expectedCanonical = '/concept';

    const result = metadata.alternates?.canonical;

    expect(result).toBe(expectedCanonical);
  });
});
