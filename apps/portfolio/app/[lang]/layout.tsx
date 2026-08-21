import { GoogleTagManager } from '@next/third-parties/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getDictionary } from '../../i18n/dictionaries';
import { languages, resolveLanguage } from '../../i18n/settings';
import { getLocalizedUrl, siteBaseUrl } from '../site';

import '../globals.css';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { lang } = await params;
  const language = resolveLanguage(lang);
  const dictionary = await getDictionary(language);
  const title = 'K2.B.G. Technology';
  const description = dictionary.metadata.description;
  const url = getLocalizedUrl(language);
  const ogImage = new URL('/images/hero-og.jpg', siteBaseUrl).toString();

  return {
    metadataBase: siteBaseUrl,
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        languages.map((alternateLanguage) => [
          alternateLanguage,
          getLocalizedUrl(alternateLanguage),
        ])
      ),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: title,
      type: 'website',
      locale: language === 'ja' ? 'ja_JP' : 'en_US',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  } satisfies Metadata;
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const { lang } = await params;
  const language = resolveLanguage(lang);

  return (
    <html lang={language} dir="ltr">
      <body>{children}</body>
      {process.env.NODE_ENV === 'production' && (
        <GoogleTagManager gtmId={process.env.GOOGLE_TAG_MANAGER_ID || ''} />
      )}
    </html>
  );
}
