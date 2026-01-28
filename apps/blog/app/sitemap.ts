import type { MetadataRoute } from 'next';

import { createFetchAllSlugsUseCase } from '../infrastructure/di';
import { Category } from '../modules/domain/post/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.SITE_BASE_URL || 'http://localhost:3000';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/concept`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  try {
    const fetchAllSlugs = createFetchAllSlugsUseCase();
    const { slugs } = await fetchAllSlugs.execute();

    const articlePages: MetadataRoute.Sitemap = slugs.map((slug) => ({
      url: `${baseUrl}/blog/${slug.id}/${slug.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

    const categoryPages: MetadataRoute.Sitemap = Object.values(Category).map(
      (category) => ({
        url: `${baseUrl}/category/${category}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    );

    return [...staticPages, ...articlePages, ...categoryPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
