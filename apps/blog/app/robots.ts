import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_mail-templates/'],
    },
    sitemap: `${
      process.env.BLOG_SITE_BASE_URL || 'http://localhost:3000'
    }/sitemap.xml`,
  };
}
