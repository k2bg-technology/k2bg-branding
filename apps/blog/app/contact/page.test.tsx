import { describe, expect, it, vi } from 'vitest';

import { BLOG_SITE_NAME } from '../siteMetadata';

import { metadata } from './page';

const { defaultOgImageUrl } = vi.hoisted(() => ({
  defaultOgImageUrl: 'https://example.com/og.png',
}));

vi.mock('../../infrastructure/di', () => ({
  getDefaultOgImageUrl: () => defaultOgImageUrl,
}));

const expectedTitle = 'お問い合わせページ';
const expectedDescription = `${BLOG_SITE_NAME} へのお問い合わせはこちらからお送りください。`;

describe('contact page metadata', () => {
  it('titles the page after the contact form it hosts', () => {
    const result = metadata.title;

    expect(result).toBe(expectedTitle);
  });

  it('describes the page as the way to send an enquiry', () => {
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

  it('declares the contact page as its own canonical URL', () => {
    const expectedCanonical = '/contact';

    const result = metadata.alternates?.canonical;

    expect(result).toBe(expectedCanonical);
  });
});
