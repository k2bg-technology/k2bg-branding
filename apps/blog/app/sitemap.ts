import type { MetadataRoute } from 'next';

import { createFetchAllSlugsUseCase } from '../infrastructure/di';
import { LISTED_CATEGORIES } from './siteMetadata';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.BLOG_SITE_BASE_URL || 'http://localhost:3000';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog`,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/concept`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  try {
    const fetchAllSlugs = createFetchAllSlugsUseCase();
    const { slugs } = await fetchAllSlugs.execute();
    const newestRevisionDate =
      slugs.length > 0
        ? new Date(
            Math.max(
              ...slugs.map((slug) => new Date(slug.revisionDate).getTime())
            )
          )
        : undefined;

    const datedStaticPages: MetadataRoute.Sitemap = staticPages.map((page) => ({
      ...page,
      ...(newestRevisionDate && { lastModified: newestRevisionDate }),
    }));

    const articlePages: MetadataRoute.Sitemap = slugs.map((slug) => ({
      url: `${baseUrl}/blog/${slug.id}/${slug.slug}`,
      lastModified: new Date(slug.revisionDate),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

    const categoryPages: MetadataRoute.Sitemap = LISTED_CATEGORIES.map(
      (category) => ({
        url: `${baseUrl}/category/${category}`,
        ...(newestRevisionDate && { lastModified: newestRevisionDate }),
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    );

    return [...datedStaticPages, ...articlePages, ...categoryPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
