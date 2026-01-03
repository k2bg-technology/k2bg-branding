import { GoogleTagManager } from '@next/third-parties/google';
import { Metadata } from 'next';

import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';
import GoogleAdsense from '../components/google-adsense/GoogleAdsense';
import { PageScrollArea } from '../components/page-scroll-area/PageScrollArea';
import ReactQueryClientProvider from '../components/react-query-client-provider/ReactQueryClientProvider';
import { Toaster } from '../components/toaster/Toaster';

import './globals.css';

const siteBaseUrl = process.env.SITE_BASE_URL;

if (!siteBaseUrl && process.env.NODE_ENV === 'production') {
  throw new Error(
    'SITE_BASE_URL environment variable is required in production'
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
            <div className="min-h-screen grid grid-rows-[3rem_1fr_18.75rem] grid-cols-[1fr_calc(100%-3rem)_1fr] md:grid-cols-[1fr_46rem_1fr] xl:grid-cols-[1fr_77rem_1fr]">
              <main className="col-start-2 -col-end-2 grid grid-cols-4 md:grid-cols-6 xl:grid-cols-12 gap-x-8 gap-y-12 py-12">
                {children}
              </main>
              <Footer />
              <Header />
            </div>
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
