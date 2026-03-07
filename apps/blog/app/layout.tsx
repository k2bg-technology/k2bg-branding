import type { Metadata } from 'next';
import { GoogleScripts } from '../components/google-scripts/GoogleScripts';
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
      <GoogleScripts />
    </html>
  );
}
