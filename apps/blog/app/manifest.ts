import type { MetadataRoute } from 'next';

import {
  blogSiteDescription,
  blogSiteName,
  blogThemeColor,
} from './siteMetadata';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: blogSiteName,
    short_name: 'K2.B.G Blog',
    description: blogSiteDescription,
    lang: 'ja',
    start_url: '/blog',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: blogThemeColor,
    icons: [
      {
        src: '/favicon.ico',
        sizes: '16x16 32x32',
        type: 'image/x-icon',
      },
    ],
  };
}
