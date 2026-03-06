import Link from 'next/link';
import { Avatar } from 'ui';
import type {
  PaginatedResult,
  PostSummaryOutput,
} from '../../modules/post/use-cases';
import { BlogCard } from '../blog-card';
import { CloudinaryImage } from '../cloudinary-image/CloudinaryImage';
import { Pagination } from '../pagination/Pagination';

interface Props {
  fetchArticles: () => Promise<PaginatedResult<PostSummaryOutput>>;
}

export async function Articles(props: Props) {
  const { fetchArticles } = props;

  const { items: articles, totalPages } = await fetchArticles();

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 col-span-full gap-x-8 gap-y-8 place-content-start">
          {articles.map((article) => (
            <BlogCard key={article.title} className="flex-col gap-spacious">
              {article.imageUrl && (
                <Link
                  href={`/blog/${article.slug}`}
                  className="peer"
                  data-gtm="article_click_back_number_image"
                >
                  <BlogCard.Media className="relative w-full h-[16rem]">
                    <CloudinaryImage
                      publicId={article.id}
                      src={article.imageUrl}
                      alt="media"
                      className="aspect-square h-full w-full object-cover hover:scale-105 transition-transform"
                      fill
                      sizes="(max-width: 768px) calc(100vw - 3rem), (max-width: 1280px) 22rem, 25rem"
                      quality={30}
                    />
                  </BlogCard.Media>
                </Link>
              )}
              <BlogCard.Content
                category={
                  <Link
                    href={`/category/${article.category}`}
                    data-gtm="article_click_back_number_category"
                  >
                    {article.category}
                  </Link>
                }
                heading={
                  <Link
                    href={`/blog/${article.slug}`}
                    className="heading-link"
                    data-gtm="article_click_back_number_heading"
                  >
                    <h2 className="text-heading-2 leading-heading-2 font-bold hover:text-base-black/80 hover:underline">
                      {article.title}
                    </h2>
                  </Link>
                }
                excerpt={article.excerpt ?? undefined}
                avatar={
                  article.author && (
                    <Avatar>
                      <Avatar.Image
                        alt="author"
                        src={article.author.avatarUrl ?? undefined}
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
        <Pagination count={totalPages} />
      </div>
    </>
  );
}
