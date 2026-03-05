import { GoogleTagManager } from '@next/third-parties/google';
import type { Metadata } from 'next';
import { GoogleAdsense } from '../components/google-adsense/GoogleAdsense';
import { PageScrollArea } from '../components/page-scroll-area/PageScrollArea';
import { ReactQueryClientProvider } from '../components/react-query-client-provider/ReactQueryClientProvider';
import { Toaster } from '../components/toaster/Toaster';
import './globals.css';

const siteBaseUrl = process.env.BLOG_SITE_BASE_URL;

if (!siteBaseUrl && process.env.NODE_ENV === 'production') {
  throw new Error(
    'BLOG_SITE_BASE_URL environment variable is required in production'
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl || 'http://localhost:3000'),
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
      {process.env.NODE_ENV === 'production' && (
        <GoogleTagManager gtmId={process.env.GOOGLE_TAG_MANAGER_ID || ''} />
      )}
      {process.env.NODE_ENV === 'production' && <GoogleAdsense />}
    </html>
  );
}
