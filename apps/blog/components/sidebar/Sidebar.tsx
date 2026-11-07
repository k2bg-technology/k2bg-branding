import Image from 'next/image';
import { SidebarAd } from '../google-adsense/SidebarAd';
import { InstagramTimeline } from '../instagram-timeline/InstagramTimeline';
import { ProfileCard } from '../profile-card/ProfileCard';
import { FacebookShareLink } from '../sns-share-link/FacebookShareLink';
import { HatenaShareLink } from '../sns-share-link/HatenaShareLink';
import { LineShareLink } from '../sns-share-link/LineShareLink';
import { PinterestShareLink } from '../sns-share-link/PinterestShareLink';
import { XShareLink } from '../sns-share-link/XShareLink';

import { SidebarItem } from './SidebarItem';

export function Sidebar() {
  return (
    <aside className="contents">
      <div className="grid auto-rows-max gap-spacious max-w-[18.125rem] h-full">
        <SidebarItem title="プロフィール">
          <ProfileCard />
        </SidebarItem>
        <SidebarItem title="Instagram">
          <InstagramTimeline />
        </SidebarItem>
        <div className="self-start sticky top-[3rem] flex flex-col gap-6">
          <SidebarItem title="SNSシェア">
            <div className="flex flex-row gap-normal">
              <XShareLink />
              <LineShareLink />
              <FacebookShareLink />
              <PinterestShareLink />
              <HatenaShareLink />
            </div>
          </SidebarItem>
          {process.env.NODE_ENV === 'production' ? (
            <SidebarAd />
          ) : (
            <div className="h-[18.125rem] relative">
              <Image
                alt="google adsense"
                src="/adsense_dummy.png"
                className="aspect-square object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 300px"
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
