import { GoogleTagManager } from '@next/third-parties/google';
import Script from 'next/script';

const gtmId = process.env.GOOGLE_TAG_MANAGER_ID;
const adsenseClientId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID;

export function GoogleScripts() {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      {adsenseClientId && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
