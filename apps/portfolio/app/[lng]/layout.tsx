import { GoogleTagManager } from '@next/third-parties/google';
import { dir } from 'i18next';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslation } from '../../i18n';
import { languages, resolveLanguage } from '../../i18n/settings';

import '../globals.css';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng } = await params;
  const language = resolveLanguage(lng);
  const { t } = await getTranslation(language);
  const siteBaseUrl = process.env.PORTFOLIO_SITE_BASE_URL;
  const title = 'K2.B.G. Technology';
  const description = t('metadata.description');
  const minimalMetadata: Metadata = {
    metadataBase: siteBaseUrl ? new URL(siteBaseUrl) : undefined,
    title,
    description,
    robots: { index: true, follow: true },
  };

  if (!siteBaseUrl) {
    return minimalMetadata;
  }

  const baseUrl = new URL(siteBaseUrl);
  const url = `${baseUrl.origin}/${language}`;
  const ogImage = `${baseUrl.origin}/images/hero-og.jpg`;

  return {
    ...minimalMetadata,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        languages.map((l) => [l, `${baseUrl.origin}/${l}`])
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
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;

  return (
    <html lang={lng} dir={dir(lng)}>
      <body>{children}</body>
      {process.env.NODE_ENV === 'production' && (
        <GoogleTagManager gtmId={process.env.GOOGLE_TAG_MANAGER_ID || ''} />
      )}
    </html>
  );
}
