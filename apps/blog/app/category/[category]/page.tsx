import { Suspense } from 'react';
import { Avatar, BlogCard } from 'ui';
import Link from 'next/link';
import Image from 'next/image';

import Article from '../../modules/domain/article';
import Notion from '../../modules/data-access/notion';
import Pagination from '../../components/pagination/Pagination';

export async function generateStaticParams() {
  return ['engineering', 'design', 'data-science', 'life-style'].map(
    (category) => ({
      category,
    })
  );
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams?: {
    page?: string;
  };
}) {
  const currentPage = Number(searchParams?.page) || 1;

  const filter = {
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
  };

  const sorts = [
    {
      property: 'releaseDate',
      direction: 'descending',
    } as const,
  ];

  const PAGE_SIZE = 6;

  const databasePagination = await new Notion.Fetcher()
    .fetchDatabase({
      filter_properties: ['title'],
      filter,
      sorts,
    })
    .then((res) =>
      res.results.reduce<Record<string, string>>(
        (prev, result, index) =>
          index % PAGE_SIZE === 0
            ? { ...prev, [index / PAGE_SIZE]: result.id }
            : prev,
        {}
      )
    );

  const database = await new Notion.Fetcher().fetchDatabase({
    filter,
    sorts,
    page_size: PAGE_SIZE,
    start_cursor: databasePagination[currentPage - 1],
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
      <Suspense key={currentPage}>
        <div className="grid grid-cols-[subgrid] col-span-full py-12">
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
        <div className="flex justify-center grid-cols-[subgrid] col-span-full py-12">
          <Pagination count={Object.keys(databasePagination).length} />
        </div>
      </Suspense>
    </>
  );
}
