'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    adsbygoogle: Record<string, string>[];
  }
}

export default function SideBarAd() {
  const pathName = usePathname();

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
        data-ad-slot="9152299424"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
