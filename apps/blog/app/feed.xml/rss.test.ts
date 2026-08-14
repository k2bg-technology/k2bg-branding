import { describe, expect, it, vi } from 'vitest';

import type { PostSummaryOutput } from '../../modules/post/use-cases';
import { buildRssFeed, escapeXml } from './rss';

describe('escapeXml', () => {
  it('escapes XML special characters', () => {
    expect(escapeXml(`Tom & "Jerry" <tag> 'value'`)).toBe(
      'Tom &amp; &quot;Jerry&quot; &lt;tag&gt; &apos;value&apos;'
    );
  });
});

describe('buildRssFeed', () => {
  it('renders RSS item fields with escaped text', () => {
    vi.setSystemTime(new Date('2024-02-01T00:00:00.000Z'));
    const post: PostSummaryOutput = {
      id: 'post-id',
      title: 'A & B <C>',
      excerpt: 'Learn "RSS" safely',
      imageUrl: 'https://example.com/image.png',
      slug: 'post-id/a-b-c',
      category: 'ENGINEERING',
      author: null,
      releaseDate: '2024-01-10',
    };

    const sut = buildRssFeed({
      baseUrl: 'https://example.com/',
      posts: [post],
    });

    expect(sut).toContain('<rss version="2.0">');
    expect(sut).toContain('<title>A &amp; B &lt;C&gt;</title>');
    expect(sut).toContain(
      '<link>https://example.com/blog/post-id/a-b-c</link>'
    );
    expect(sut).toContain(
      '<description>Learn &quot;RSS&quot; safely</description>'
    );
    expect(sut).toContain('<pubDate>Wed, 10 Jan 2024 00:00:00 GMT</pubDate>');
    expect(sut).toContain(
      '<guid isPermaLink="true">https://example.com/blog/post-id/a-b-c</guid>'
    );
  });
});
