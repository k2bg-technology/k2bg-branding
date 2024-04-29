import { Avatar, BlogCard } from 'ui';
import Link from 'next/link';
import Image from 'next/image';

import Article from '../../modules/domain/article';
import Notion from '../../modules/data-access/notion';

export async function generateStaticParams() {
  return ['engineering', 'design', 'data-science', 'life-style'].map(
    (category) => ({
      category,
    })
  );
}

export default async function Page({
  params,
}: {
  params: { category: string };
}) {
  const database = await new Notion.Fetcher().fetchDatabase({
    filter: {
      and: [
        {
          property: 'status',
          status: {
            equals: 'published',
          },
        },
        {
          property: 'category',
          select: {
            equals: params.category,
          },
        },
      ],
    },
  });
  const pages = database.results.map((result) => new Notion.Page(result));
  const articles = new Article.List(pages);

  const placeHolders = await Article.List.convertImageToPlaceholder(
    articles.all
  );

  return (
    <>
      <h1 className="col-span-full text-header-1 font-bold capitalize py-4">
        {params.category}
      </h1>
      <div className="grid grid-cols-[subgrid] col-span-full py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 col-span-full gap-12 place-content-start">
          {articles.all.map((article) => (
            <BlogCard key={article.title} className="flex-col gap-6">
              {article.image && (
                <Link href={`/blog/${article.slug}`} passHref>
                  <BlogCard.Media className="relative w-full h-[26.5rem]">
                    <Image
                      alt="media"
                      src={article.image}
                      className="aspect-square h-full w-full object-cover"
                      fill
                      sizes="100%"
                      placeholder="blur"
                      blurDataURL={placeHolders[article.id]?.base64}
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
      </div>
    </>
  );
}
