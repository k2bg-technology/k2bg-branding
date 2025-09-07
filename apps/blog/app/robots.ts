import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_mail-templates/'],
    },
    sitemap: `${
      process.env.SITE_DOMAIN || 'http://localhost:3000'
    }/sitemap.xml`,
  };
}
