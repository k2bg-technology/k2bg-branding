import { Suspense } from 'react';

import Notion from '../../../modules/data-access/notion';
import Pagination from '../../../components/pagination/Pagination';
import { Articles } from '../../../components/articles/Articles';
import { ArticlesSkelton } from '../../../components/articles/ArticlesSkelton';
import Article from '../../../modules/domain/article';
import Cloudinary from '../../../modules/data-access/cloudinary';

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

  return (
    <>
      <h1 className="col-span-full text-header-1 font-bold capitalize">
        {params.category}
      </h1>
      <Suspense key={currentPage} fallback={<ArticlesSkelton />}>
        <div className="grid grid-cols-[subgrid] col-span-full">
          <Articles fetchArticles={fetchArticles} />
        </div>
        <div className="flex justify-center grid-cols-[subgrid] col-span-full">
          <Pagination count={Object.keys(databasePagination).length} />
        </div>
      </Suspense>
    </>
  );
}
