import { Noto_Sans_JP } from 'next/font/google';

import Header from './components/header/Header';
import Footer from './components/footer/Footer';

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
        <div className="grid grid-rows-[50px_1fr_300px] gap-y-8 h-screen">
          <Header />
          <main className="grid grid-cols-12 gap-x-12 w-[1140px] px-[15px] mx-auto">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
