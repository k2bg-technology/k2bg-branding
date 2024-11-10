import React from 'react';
import Image from 'next/image';

import XTimeline from '../x-timeline/XTimeline';
import InstagramTimeline from '../instagram-timeline/InstagramTimeline';
import ProfileCard from '../profile-card/ProfileCard';

export default function Sidebar() {
  return (
    <aside>
      <div className="grid gap-spacious w-[18.375rem]">
        {/* eslint-disable-next-line turbo/no-undeclared-env-vars */}
        {process.env.NODE_ENV === 'development' && (
          <div className="relative h-[18.375rem]">
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
