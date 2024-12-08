import Link from 'next/link';
import { Avatar, BlogCard } from 'ui';

import { CloudinaryImage } from '../cloudinary-image/CloudinaryImage';
import { Post } from '../../modules/domain/post/types';

interface Props {
  fetchArticles: () => Promise<Post[]>;
}

export async function Articles(props: Props) {
  const { fetchArticles } = props;

  const articles = await fetchArticles();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 col-span-full gap-6 place-content-start">
      {articles.map((article) => (
        <BlogCard key={article.title} className="flex-col gap-spacious">
          {article.imageUrl && (
            <Link href={`/blog/${article.slug}`} passHref>
              <BlogCard.Media className="relative w-full h-[16rem]">
                <CloudinaryImage
                  publicId={article.id}
                  alt="media"
                  className="aspect-square h-full w-full object-cover"
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
              <Link href={`/blog/${article.slug}`}>
                <h2 className="text-header-2 leading-header-2 font-bold">
                  {article.title}
                </h2>
              </Link>
            }
            excerpt={article.excerpt}
            avatar={
              article.author && (
                <Avatar>
                  <Avatar.Image alt="author" src={article.author.avatarUrl} />
                </Avatar>
              )
            }
            date={article.releaseDate}
          />
        </BlogCard>
      ))}
    </div>
  );
}
