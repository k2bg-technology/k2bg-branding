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
        <div className="grid grid-rows-[5rem_1fr_30rem] gap-y-8 h-screen">
          <Header />
          <main className="grid auto-rows-max grid-cols-4 md:grid-cols-6 xl:grid-cols-12 gap-x-12 w-full md:w-[72rem] xl:w-[114rem] px-6 mx-auto">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
