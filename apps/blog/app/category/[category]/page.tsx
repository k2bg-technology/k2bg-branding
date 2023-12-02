import { Avatar, BlogCard } from 'ui';
import Link from 'next/link';
import Image from 'next/image';

import Blog from '../../modules/blog';
import Notion from '../../modules/notion';

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
  const articles = new Blog.Articles(pages);

  return (
    <>
      <h1 className="col-span-full text-heading-1 font-bold capitalize py-[10px]">
        {params.category}
      </h1>
      <div className="grid grid-cols-[subgrid] col-span-full py-[30px]">
        <div className="grid grid-cols-3 col-span-full gap-12 place-content-start">
          {articles.all.map((article) => (
            <BlogCard key={article.title} className="flex-col gap-6">
              <BlogCard.Media className="relative w-full h-[265px]">
                {article.image && (
                  <Link href={`blog/${article.slug}` || '#'} passHref>
                    <Image
                      alt="media"
                      src={article.image}
                      className="aspect-square h-full w-full object-cover"
                      fill
                    />
                  </Link>
                )}
              </BlogCard.Media>
              <BlogCard.Content
                category={
                  <Link href={`category/${article.category}` || '#'}>
                    {article.category}
                  </Link>
                }
                heading={
                  <Link href={`blog/${article.slug}` || '#'}>
                    <h2 className="text-heading-2 leading-heading-2 font-bold">
                      {article.title}
                    </h2>
                  </Link>
                }
                excerpt={article.excerpt}
                avatar={
                  <Avatar
                    image={
                      <div className="relative w-full h-full">
                        <Image
                          alt="author"
                          src={article.avatar.imageUrl}
                          className="aspect-square h-full w-full object-cover"
                          fill
                        />
                      </div>
                    }
                    name={article.avatar.name}
                  />
                }
                date={article.date}
              />
            </BlogCard>
          ))}
        </div>
      </div>
    </>
  );
}
