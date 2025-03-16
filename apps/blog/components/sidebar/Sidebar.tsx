import React from 'react';
import Image from 'next/image';

import InstagramTimeline from '../instagram-timeline/InstagramTimeline';
import ProfileCard from '../profile-card/ProfileCard';
import SideBarAd from '../google-adsense/SideBarAd';

export default function Sidebar() {
  return (
    <aside className="contents">
      <div className="grid auto-rows-max gap-spacious max-w-[18.125rem] h-full">
        <ProfileCard />
        <InstagramTimeline />
        <div className="self-start sticky top-[5rem]">
          {process.env.NODE_ENV === 'production' ? (
            <SideBarAd />
          ) : (
            <div className="h-[18.125rem]">
              <Image
                alt="google adsense"
                src="/adsense_dummy.png"
                className="aspect-square object-cover"
                fill
                sizes="100%"
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
