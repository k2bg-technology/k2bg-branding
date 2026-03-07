import { GoogleTagManager } from '@next/third-parties/google';
import { GoogleAdsense } from '../google-adsense/GoogleAdsense';

export function ThirdPartyScripts() {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const gtmId = process.env.GOOGLE_TAG_MANAGER_ID;

  return (
    <>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      <GoogleAdsense />
    </>
  );
}
