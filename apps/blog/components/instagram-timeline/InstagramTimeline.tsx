import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import Instagram from '../../modules/data-access/instagram';

const MAX_MEDIA_COUNT = 6;

export default async function InstagramTimeline() {
  const InstagramFetcher = new Instagram.Fetcher();

  const userMedia = await InstagramFetcher.fetchUserMedia();

  if (!userMedia.data) return null;

  const mediaData = await Promise.all(
    userMedia.data.flatMap((data, index) =>
      index < MAX_MEDIA_COUNT ? InstagramFetcher.fetchMediaData(data.id) : []
    )
  );

  return (
    <div>
      <p className="mb-6 text-subtitle-sm font-bold border-b-2 border-b-slate-100">
        Instagram
      </p>
      <div className="grid grid-cols-2 gap-2">
        {mediaData.map((data) => (
          <Link
            key={data.id}
            href={data.permalink}
            passHref
            target="_blank"
            rel="noreferrer"
          >
            <div className="relative w-[8.8125rem] h-[8.8125rem]">
              <Image
                alt="instagram media"
                src={
                  data.media_type === 'IMAGE'
                    ? data.media_url
                    : data.thumbnail_url
                }
                className="aspect-square w-full h-full object-cover"
                fill
                sizes="100%"
                priority
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
