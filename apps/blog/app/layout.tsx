import type { Metadata } from 'next';
import { GoogleScripts } from '../components/google-scripts/GoogleScripts';
import { PageScrollArea } from '../components/page-scroll-area/PageScrollArea';
import { ReactQueryClientProvider } from '../components/react-query-client-provider/ReactQueryClientProvider';
import { Toaster } from '../components/toaster/Toaster';
import { getDefaultOgImageUrl } from '../infrastructure/di';
import {
  BLOG_SITE_DESCRIPTION,
  BLOG_SITE_NAME,
  getBlogSiteBaseUrl,
} from './siteMetadata';
import './globals.css';

const siteBaseUrl = getBlogSiteBaseUrl();

if (!process.env.BLOG_SITE_BASE_URL && process.env.NODE_ENV === 'production') {
  throw new Error(
    'BLOG_SITE_BASE_URL environment variable is required in production'
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: {
    default: BLOG_SITE_NAME,
    template: `%s | ${BLOG_SITE_NAME}`,
  },
  description: BLOG_SITE_DESCRIPTION,
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  openGraph: {
    title: BLOG_SITE_NAME,
    description: BLOG_SITE_DESCRIPTION,
    type: 'website',
    locale: 'ja_JP',
    siteName: BLOG_SITE_NAME,
    images: [{ url: getDefaultOgImageUrl(), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: BLOG_SITE_NAME,
    description: BLOG_SITE_DESCRIPTION,
    images: [getDefaultOgImageUrl()],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <ReactQueryClientProvider>
          <PageScrollArea>
            {children}
            <Toaster />
          </PageScrollArea>
        </ReactQueryClientProvider>
      </body>
      <GoogleScripts />
    </html>
  );
}
