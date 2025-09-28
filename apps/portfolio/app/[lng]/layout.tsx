import { ReactNode } from 'react';
import { Metadata } from 'next';
import { dir } from 'i18next';
import { GoogleTagManager } from '@next/third-parties/google';

import { languages, Language } from '../../i18n/settings';

import '../globals.css';

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
    <html lang={lng} dir={dir(lng)}>
      <body>{children}</body>
      <GoogleTagManager gtmId={process.env.GOOGLE_TAG_MANAGER_ID || ''} />
    </html>
  );
}
