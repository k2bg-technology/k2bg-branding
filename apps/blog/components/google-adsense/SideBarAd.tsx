'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: Record<string, string>[];
  }
}

export function SideBarAd() {
  const pathName = usePathname();

  // biome-ignore lint/correctness/useExhaustiveDependencies: should set ads when page changes
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error(err);
    }
  }, [pathName]);

  return (
    <div key={pathName} className="max-w-[18.125rem]">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-adtest={process.env.NODE_ENV === 'production' ? 'off' : 'on'}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID}
        data-ad-slot={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_AD_SLOT_ID}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
