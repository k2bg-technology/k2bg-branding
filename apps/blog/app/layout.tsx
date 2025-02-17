import { Noto_Sans_JP } from 'next/font/google';
import { ScrollArea } from 'ui';

import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';
import GoogleAdsense from '../components/google-adsense/GoogleAdsense';

import './globals.css';

// If loading a variable font, you don't need to specify the font weight
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-noto-sans-jp',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body>
        <ScrollArea className="max-h-dvh">
          <div className="grid grid-rows-[3rem_1fr_18.75rem] grid-cols-[1fr_calc(100%-2rem)_1fr] md:grid-cols-[1fr_46rem_1fr] xl:grid-cols-[1fr_77rem_1fr]">
            <Header />
            <main className="col-start-2 -col-end-2 grid grid-cols-4 md:grid-cols-6 xl:grid-cols-12 gap-x-6 gap-y-12 auto-rows-max py-12">
              {children}
            </main>
            <Footer />
          </div>
        </ScrollArea>
      </body>
      <GoogleAdsense />
    </html>
  );
}
