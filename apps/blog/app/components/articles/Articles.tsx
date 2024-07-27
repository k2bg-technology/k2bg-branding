import Link from 'next/link';
import Image from 'next/image';
import { Avatar, BlogCard } from 'ui';

import Article from '../../modules/domain/article';

interface Props {
  fetchArticles: () => Promise<{
    articles: InstanceType<(typeof Article)['List']>;
    placeHolders: Record<
      InstanceType<(typeof Article)['Single']>['id'],
      string
    >;
  }>;
}

export async function Articles(props: Props) {
  const { fetchArticles } = props;

  const { articles, placeHolders } = await fetchArticles();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 col-span-full gap-12 place-content-start">
      {articles.all.map((article) => (
        <BlogCard key={article.title} className="flex-col gap-6">
          {article.image && (
            <Link href={`/blog/${article.slug}`} passHref>
              <BlogCard.Media className="relative w-full h-[26.5rem]">
                <Image
                  alt="media"
                  src={`/api/notion/image/${article.id}`}
                  className="aspect-square h-full w-full object-cover"
                  fill
                  sizes="100%"
                  placeholder="blur"
                  blurDataURL={placeHolders[article.id]}
                  unoptimized={article.imageExtension === '.gif'}
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
                <Avatar
                  image={
                    <div className="relative w-full h-full">
                      <Image
                        alt="author"
                        src={article.author?.avatar_url ?? ''}
                        className="aspect-square h-full w-full object-cover"
                        fill
                        sizes="100%"
                      />
                    </div>
                  }
                  name={article.author.name ?? ''}
                />
              )
            }
            date={article.releaseDate}
          />
        </BlogCard>
      ))}
    </div>
  );
}
