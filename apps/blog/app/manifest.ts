import type { MetadataRoute } from 'next';

import {
  BLOG_SITE_DESCRIPTION,
  BLOG_SITE_NAME,
  BLOG_THEME_COLOR,
} from './siteMetadata';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BLOG_SITE_NAME,
    short_name: 'K2.B.G Blog',
    description: BLOG_SITE_DESCRIPTION,
    lang: 'ja',
    start_url: '/blog',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: BLOG_THEME_COLOR,
    icons: [
      {
        src: '/favicon.ico',
        sizes: '16x16 32x32',
        type: 'image/x-icon',
      },
    ],
  };
}
