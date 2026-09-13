import { describe, expect, it, vi } from 'vitest';
import { metadata } from './layout';
import {
  BLOG_SITE_DESCRIPTION,
  BLOG_SITE_NAME,
  getBlogSiteBaseUrl,
} from './siteMetadata';

const { defaultOgImageUrl } = vi.hoisted(() => ({
  defaultOgImageUrl: 'https://example.com/og.png',
}));

vi.mock('../infrastructure/di', () => ({
  getDefaultOgImageUrl: () => defaultOgImageUrl,
}));

describe('root layout metadata', () => {
  it('uses the site name as the default title and as the title template', () => {
    const expectedTitle = {
      default: BLOG_SITE_NAME,
      template: `%s | ${BLOG_SITE_NAME}`,
    };

    const result = metadata.title;

    expect(result).toEqual(expectedTitle);
  });

  it('describes the site with the shared site description', () => {
    const expectedDescription = BLOG_SITE_DESCRIPTION;

    const result = metadata.description;

    expect(result).toBe(expectedDescription);
  });

  it('resolves relative metadata URLs against the configured base URL', () => {
    const expectedBaseUrl = new URL(getBlogSiteBaseUrl()).href;

    const result = metadata.metadataBase;

    expect(result).toBeInstanceOf(URL);
    expect(String(result)).toBe(expectedBaseUrl);
  });

  it('shares the site name, description and default image over Open Graph', () => {
    const expectedOpenGraph = {
      title: BLOG_SITE_NAME,
      description: BLOG_SITE_DESCRIPTION,
      siteName: BLOG_SITE_NAME,
      type: 'website',
      locale: 'ja_JP',
      images: [{ url: defaultOgImageUrl, width: 1200, height: 630 }],
    };

    const result = metadata.openGraph;

    expect(result).toMatchObject(expectedOpenGraph);
  });

  it('shares the site name, description and default image over Twitter cards', () => {
    const expectedTwitter = {
      card: 'summary_large_image',
      title: BLOG_SITE_NAME,
      description: BLOG_SITE_DESCRIPTION,
      images: [defaultOgImageUrl],
    };

    const result = metadata.twitter;

    expect(result).toMatchObject(expectedTwitter);
  });

  it('points browsers at the favicon', () => {
    const expectedIcons = { icon: '/favicon.ico' };

    const result = metadata.icons;

    expect(result).toEqual(expectedIcons);
  });

  it('advertises the RSS feed as an alternate representation', () => {
    const expectedAlternates = {
      types: { 'application/rss+xml': '/feed.xml' },
    };

    const result = metadata.alternates;

    expect(result).toMatchObject(expectedAlternates);
  });
});
