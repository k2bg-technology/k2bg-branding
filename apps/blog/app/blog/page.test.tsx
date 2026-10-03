import { describe, expect, it, vi } from 'vitest';

import { BLOG_SITE_DESCRIPTION, BLOG_SITE_NAME } from '../siteMetadata';

import { metadata } from './page';

const { defaultOgImageUrl } = vi.hoisted(() => ({
  defaultOgImageUrl: 'https://example.com/og.png',
}));

vi.mock('../../infrastructure/di', () => ({
  getDefaultOgImageUrl: () => defaultOgImageUrl,
  createFetchPostSummariesUseCase: vi.fn(),
}));

describe('blog home metadata', () => {
  it('keeps the root title template off the home page title', () => {
    const expectedTitle = { absolute: BLOG_SITE_NAME };

    const result = metadata.title;

    expect(result).toEqual(expectedTitle);
  });

  it('describes the home page with the shared site description', () => {
    const expectedDescription = BLOG_SITE_DESCRIPTION;

    const result = metadata.description;

    expect(result).toBe(expectedDescription);
  });

  it('shares the site name and description over Open Graph', () => {
    const expectedOpenGraph = {
      title: BLOG_SITE_NAME,
      description: BLOG_SITE_DESCRIPTION,
      siteName: BLOG_SITE_NAME,
    };

    const result = metadata.openGraph;

    expect(result).toMatchObject(expectedOpenGraph);
  });

  it('shares the site name and description over Twitter cards', () => {
    const expectedTwitter = {
      title: BLOG_SITE_NAME,
      description: BLOG_SITE_DESCRIPTION,
    };

    const result = metadata.twitter;

    expect(result).toMatchObject(expectedTwitter);
  });

  it('declares the blog index as its own canonical URL', () => {
    const expectedCanonical = '/blog';

    const result = metadata.alternates?.canonical;

    expect(result).toBe(expectedCanonical);
  });
});
