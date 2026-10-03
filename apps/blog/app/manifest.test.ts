import { describe, expect, it } from 'vitest';

import manifest from './manifest';
import {
  BLOG_SITE_DESCRIPTION,
  BLOG_SITE_NAME,
  BLOG_THEME_COLOR,
} from './siteMetadata';

describe('manifest', () => {
  it('names the installed app after the site', () => {
    const sut = manifest;
    const expectedName = BLOG_SITE_NAME;

    const result = sut();

    expect(result.name).toBe(expectedName);
  });

  it('describes the installed app with the shared site description', () => {
    const sut = manifest;
    const expectedDescription = BLOG_SITE_DESCRIPTION;

    const result = sut();

    expect(result.description).toBe(expectedDescription);
  });

  it('themes the installed app with the shared theme color', () => {
    const sut = manifest;
    const expectedThemeColor = BLOG_THEME_COLOR;

    const result = sut();

    expect(result.theme_color).toBe(expectedThemeColor);
  });

  it('launches the installed app on the blog index', () => {
    const sut = manifest;
    const expectedStartUrl = '/blog';

    const result = sut();

    expect(result.start_url).toBe(expectedStartUrl);
  });
});
