import React from 'react';
import Image from 'next/image';

import XTimeline from '../x-timeline/XTimeline';
import InstagramTimeline from '../instagram-timeline/InstagramTimeline';
import ProfileCard from '../profile-card/ProfileCard';

export default function Sidebar() {
  return (
    <aside>
      <div className="grid gap-10 w-[25.5rem]">
        <div className="relative h-[25.5rem] w-[25.5rem]">
          <Image
            alt="google adsense"
            src="/adsense_dummy.png"
            className="aspect-square h-full w-full object-cover"
            fill
            sizes="100%"
          />
        </div>
        <ProfileCard />
        <XTimeline />
        {/* @ts-expect-error: async component */}
        <InstagramTimeline />
      </div>
    </aside>
  );
}
