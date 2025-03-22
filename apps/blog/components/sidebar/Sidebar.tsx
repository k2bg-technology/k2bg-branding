import React from 'react';
import Image from 'next/image';

import InstagramTimeline from '../instagram-timeline/InstagramTimeline';
import ProfileCard from '../profile-card/ProfileCard';
import SideBarAd from '../google-adsense/SideBarAd';
import XShareButton from '../sns-share-button/XShareButton';
import LineShareButton from '../sns-share-button/LineShareButton';
import FacebookShareButton from '../sns-share-button/FacebookShareButton';
import PinterestShareButton from '../sns-share-button/PinterestShareButton';
import HatenaShareButton from '../sns-share-button/HatenaShareButton';

import SidebarItem from './SidebarItem';

export default function Sidebar() {
  return (
    <aside className="contents">
      <div className="grid auto-rows-max gap-spacious max-w-[18.125rem] h-full">
        <ProfileCard />
        <SidebarItem title="Instagram">
          <InstagramTimeline />
        </SidebarItem>
        <div className="self-start sticky top-[3rem] flex flex-col gap-6">
          <SidebarItem title="SNSシェア">
            <div className="flex flex-row gap-normal">
              <XShareButton />
              <LineShareButton />
              <FacebookShareButton />
              <PinterestShareButton />
              <HatenaShareButton />
            </div>
          </SidebarItem>
          {process.env.NODE_ENV === 'production' ? (
            <SideBarAd />
          ) : (
            <div className="h-[18.125rem] relative">
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
