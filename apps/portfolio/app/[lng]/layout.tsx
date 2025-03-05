import { Noto_Sans_JP } from 'next/font/google';
import { ReactNode } from 'react';
import { Metadata } from 'next';
import { dir } from 'i18next';
import { GoogleTagManager } from '@next/third-parties/google';

import { languages, Language } from '../../i18n/settings';

import '../globals.css';

// If loading a variable font, you don't need to specify the font weight
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-noto-sans-jp',
});

type Params = Promise<{ lng: Language }>;

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const metadata: Metadata = {
  title: 'K2.B.G. Technology',
  description: 'K2.B.G. Technologyが提供できる価値を紹介いたします。',
};

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Params;
}) {
  const { lng } = await params;

  return (
    <html lang={lng} dir={dir(lng)} className={notoSansJP.variable}>
      <body>{children}</body>
      <GoogleTagManager gtmId={process.env.GOOGLE_TAG_MANAGER_ID || ''} />
    </html>
  );
}
