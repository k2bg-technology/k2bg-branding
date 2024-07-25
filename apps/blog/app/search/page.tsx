import { Suspense } from 'react';
import { BlogCard } from 'ui';

import Notion from '../modules/data-access/notion';
import Article from '../modules/domain/article';
import Pagination from '../components/pagination/Pagination';
import { Articles } from '../components/articles/Articles';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    page?: string;
    query?: string;
  };
}) {
  const query = searchParams?.query || '';
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
        property: 'title',
        rich_text: {
          contains: query,
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

  async function fetchArticles() {
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

    return {
      articles,
      placeHolders,
    };
  }

  return (
    <>
      <h1 className="col-span-full text-header-1 font-bold capitalize py-4">
        {searchParams?.query}
      </h1>
      <Suspense
        key={`${currentPage}-${query}`}
        fallback={
          <div className="grid grid-cols-[subgrid] col-span-full py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 col-span-full gap-12 place-content-start">
              <BlogCard className="flex-col gap-6">
                <BlogCard.Skelton />
              </BlogCard>
              <BlogCard className="flex-col gap-6">
                <BlogCard.Skelton />
              </BlogCard>
              <BlogCard className="flex-col gap-6">
                <BlogCard.Skelton />
              </BlogCard>
              <BlogCard className="flex-col gap-6">
                <BlogCard.Skelton />
              </BlogCard>
              <BlogCard className="flex-col gap-6">
                <BlogCard.Skelton />
              </BlogCard>
              <BlogCard className="flex-col gap-6">
                <BlogCard.Skelton />
              </BlogCard>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-[subgrid] col-span-full py-12">
          <Articles fetchArticles={fetchArticles} />
        </div>
        <div className="flex justify-center grid-cols-[subgrid] col-span-full py-12">
          <Pagination count={Object.keys(databasePagination).length} />
        </div>
      </Suspense>
    </>
  );
}
