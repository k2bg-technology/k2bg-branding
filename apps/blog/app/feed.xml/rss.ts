import type { PostSummaryOutput } from '../../modules/post/use-cases';
import { blogSiteDescription, blogSiteName } from '../siteMetadata';

interface RssFeedOptions {
  baseUrl: string;
  posts: PostSummaryOutput[];
}

export function buildRssFeed({ baseUrl, posts }: RssFeedOptions): string {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  const items = posts.map((post) => buildRssItem(post, normalizedBaseUrl));

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '<channel>',
    `<title>${escapeXml(blogSiteName)}</title>`,
    `<link>${escapeXml(`${normalizedBaseUrl}/blog`)}</link>`,
    `<description>${escapeXml(blogSiteDescription)}</description>`,
    '<language>ja</language>',
    `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    ...items,
    '</channel>',
    '</rss>',
  ].join('\n');
}

export function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (character) => {
    switch (character) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return character;
    }
  });
}

function buildRssItem(post: PostSummaryOutput, baseUrl: string): string {
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  const description = post.excerpt ?? '';

  return [
    '<item>',
    `<title>${escapeXml(post.title)}</title>`,
    `<link>${escapeXml(postUrl)}</link>`,
    `<description>${escapeXml(description)}</description>`,
    `<pubDate>${new Date(post.releaseDate).toUTCString()}</pubDate>`,
    `<guid isPermaLink="true">${escapeXml(postUrl)}</guid>`,
    '</item>',
  ].join('\n');
}
