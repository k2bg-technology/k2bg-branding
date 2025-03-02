import Link from 'next/link';
import { Avatar, BlogCard } from 'ui';

import { CloudinaryImage } from '../cloudinary-image/CloudinaryImage';
import { Post } from '../../modules/domain/post/types';
import { Pagination } from '../pagination/Pagination';

interface Props {
  fetchArticles: () => Promise<Post[]>;
  fetchArticlesCount: () => Promise<number>;
}

export async function Articles(props: Props) {
  const { fetchArticles, fetchArticlesCount } = props;

  const articles = await fetchArticles();
  const totalPageCount = await fetchArticlesCount();

  if (articles.length === 0) {
    return (
      <div className="grid grid-cols-1 col-span-full">
        一致する記事は見つかりませんでした。
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-[subgrid] col-span-full">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 col-span-full gap-x-6 gap-y-8 place-content-start">
          {articles.map((article) => (
            <BlogCard key={article.title} className="flex-col gap-spacious">
              {article.imageUrl && (
                <Link href={`/blog/${article.slug}`} passHref className="peer">
                  <BlogCard.Media className="relative w-full h-[16rem]">
                    <CloudinaryImage
                      publicId={article.id}
                      src={article.imageUrl}
                      alt="media"
                      className="aspect-square h-full w-full object-cover hover:scale-105 transition-transform"
                      fill
                      sizes="100%"
                      quality={30}
                    />
                  </BlogCard.Media>
                </Link>
              )}
              <BlogCard.Content
                category={
                  <Link href={`/category/${article.category}`}>
                    {article.category}
                  </Link>
                }
                heading={
                  <Link href={`/blog/${article.slug}`} className="heading-link">
                    <h2 className="text-heading-2 leading-heading-2 font-bold hover:text-base-black/80 hover:underline">
                      {article.title}
                    </h2>
                  </Link>
                }
                excerpt={article.excerpt}
                avatar={
                  article.author && (
                    <Avatar>
                      <Avatar.Image
                        alt="author"
                        src={article.author.avatarUrl}
                      />
                    </Avatar>
                  )
                }
                date={article.releaseDate}
                className="peer-hover:[&>.heading-link]:underline peer-hover:[&>.heading-link]:text-base-black/80"
              />
            </BlogCard>
          ))}
        </div>
      </div>
      <div className="flex justify-center grid-cols-[subgrid] col-span-full">
        <Pagination count={totalPageCount} />
      </div>
    </>
  );
}
