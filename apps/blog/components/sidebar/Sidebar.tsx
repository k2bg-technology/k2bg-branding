import React from 'react';
import Image from 'next/image';

import XTimeline from '../x-timeline/XTimeline';
import InstagramTimeline from '../instagram-timeline/InstagramTimeline';
import ProfileCard from '../profile-card/ProfileCard';
import SideBarAd from '../google-adsense/SideBarAd';

export default function Sidebar() {
  return (
    <aside>
      <div className="grid gap-spacious max-w-[18.125rem]">
        {process.env.NODE_ENV === 'production' ? (
          <SideBarAd />
        ) : (
          <div className="relative h-[18.125rem]">
            <Image
              alt="google adsense"
              src="/adsense_dummy.png"
              className="aspect-square object-cover"
              fill
              sizes="100%"
            />
          </div>
        )}
        <ProfileCard />
        <XTimeline />
        <InstagramTimeline />
      </div>
    </aside>
  );
}
