import Image from 'next/image';
import Link from 'next/link';

import { createFetchFeedUseCase } from '../../infrastructure/di';

const MAX_MEDIA_COUNT = 6;

export async function InstagramTimeline() {
  const fetchFeed = createFetchFeedUseCase();
  const posts = await fetchFeed.execute({ limit: MAX_MEDIA_COUNT });

  if (posts.length === 0) {
    return (
      <div className="p-spacious rounded-lg bg-base-white/50">
        <p className="text-body-r-sm leading-body-r-sm text-base-black">
          新規投稿はありません
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={post.permalink}
          target="_blank"
          rel="noreferrer"
        >
          <div className="relative w-[8.625rem] h-[8.625rem]">
            <Image
              alt="instagram media"
              src={post.displayUrl}
              className="aspect-square w-full h-full object-cover"
              width={138}
              height={138}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
