import { Suspense } from 'react';

import Notion from '../../modules/data-access/notion';
import Article from '../../modules/domain/article';
import Pagination from '../../components/pagination/Pagination';
import { Articles } from '../../components/articles/Articles';
import Cloudinary from '../../modules/data-access/cloudinary';
import { ArticlesSkelton } from '../../components/articles/ArticlesSkelton';

const PAGE_SIZE = 6;

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

    const optimizedImages = await Article.List.optimizeImage(
      articles.all,
      async (id, file) => {
        await new Cloudinary.Uploader().uploadImage(file, {
          public_id: id,
        });

        return new Cloudinary.Fetcher().getImageUrl(id, {
          fetch_format: 'auto',
          quality: 'auto',
        });
      }
    );

    return {
      articles,
      placeHolders,
      optimizedImages,
    };
  }

  const totalPageCount = Object.keys(databasePagination).length;
  const showArticles = totalPageCount > 0;

  return (
    <>
      <h1 className="col-span-full text-header-1 font-bold capitalize py-4">
        {searchParams?.query}
      </h1>
      <Suspense key={`${currentPage}-${query}`} fallback={<ArticlesSkelton />}>
        <div className="grid grid-cols-[subgrid] col-span-full">
          {showArticles ? (
            <Articles fetchArticles={fetchArticles} />
          ) : (
            <div className="grid grid-cols-1 col-span-full">
              検索キーワードに一致する記事は見つかりませんでした。
            </div>
          )}
        </div>
        {showArticles && (
          <div className="flex justify-center grid-cols-[subgrid] col-span-full">
            <Pagination count={totalPageCount} />
          </div>
        )}
      </Suspense>
    </>
  );
}
