import { Avatar, BlogCard } from 'ui';
import Image from 'next/image';
import Link from 'next/link';

import Notion from '../modules/data-access/notion';
import Article from '../modules/domain/article';
import Sidebar from '../components/sidebar/Sidebar';
import Cloudinary from '../modules/data-access/cloudinary';

const fetchDatabase = async () => {
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
          property: 'type',
          select: {
            equals: 'article',
          },
        },
      ],
    },
  });

  return database;
};

export default async function Page() {
  const database = await fetchDatabase();
  const pages = database.results.map((result) => new Notion.Page(result));
  const articles = new Article.List(pages);

  const placeHolders = await Article.List.convertImageToPlaceholder([
    articles.featureLatest,
    ...articles.featuresPreviously,
    ...articles.featuresRecently,
  ]);

  const optimizedImages = await Article.List.optimizeImage(
    [
      articles.featureLatest,
      ...articles.featuresPreviously,
      ...articles.featuresRecently,
    ],
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

  return (
    <>
      <div className="grid grid-cols-[subgrid] col-span-full border-b-2 py-12 border-b-slate-100">
        <div className="col-start-1 col-end-8">
          <BlogCard className="flex-col gap-6">
            {articles.featureLatest.image && (
              <Link href={`/blog/${articles.featureLatest.slug}`} passHref>
                <BlogCard.Media className="relative w-full h-[30rem]">
                  <Image
                    alt="media"
                    src={optimizedImages[articles.featureLatest.id]}
                    className="absolute aspect-square h-full w-full object-cover"
                    fill
                    sizes="100%"
                    priority
                    placeholder="blur"
                    blurDataURL={placeHolders[articles.featureLatest.id]}
                    quality={30}
                  />
                </BlogCard.Media>
              </Link>
            )}
            <BlogCard.Content
              category={
                <Link href={`/category/${articles.featureLatest.category}`}>
                  {articles.featureLatest.category}
                </Link>
              }
              heading={
                <Link href={`/blog/${articles.featureLatest.slug}`}>
                  <h2 className="text-header-2 leading-header-2 font-bold">
                    {articles.featureLatest.title}
                  </h2>
                </Link>
              }
              excerpt={articles.featureLatest.excerpt}
              avatar={
                articles.featureLatest.author && (
                  <Avatar
                    image={
                      <div className="relative w-full h-full">
                        <Image
                          alt="author"
                          src={articles.featureLatest.author.avatar_url ?? ''}
                          className="aspect-square h-full w-full object-cover"
                          fill
                          sizes="100%"
                        />
                      </div>
                    }
                    name={articles.featureLatest.author.name ?? ''}
                  />
                )
              }
              date={articles.featureLatest.releaseDate}
            />
          </BlogCard>
        </div>
        <div className="hidden xl:grid gap-16 col-start-8 col-end-13">
          {articles.featuresRecently.map((article) => (
            <BlogCard key={article.title} className="flex-row gap-8">
              {article.image && (
                <Link
                  href={`/blog/${article.slug}`}
                  passHref
                  className="h-full"
                >
                  <BlogCard.Media className="relative flex-none w-[16rem] h-[16rem]">
                    <Image
                      alt="media"
                      src={optimizedImages[article.id]}
                      className="aspect-square h-full w-full object-cover"
                      fill
                      placeholder="blur"
                      blurDataURL={placeHolders[article.id]}
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
                            src={article.author.avatar_url ?? ''}
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
      <div className="grid grid-cols-[subgrid] col-span-full py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 col-start-1 col-end-10 place-content-start">
          {articles.featuresRecently.map((article) => (
            <div key={article.title} className="block xl:hidden">
              <BlogCard className="flex-col gap-6">
                {article.image && (
                  <Link
                    href={`/blog/${article.slug}`}
                    passHref
                    className="h-full"
                  >
                    <BlogCard.Media className="relative w-full h-[26.5rem]">
                      <Image
                        alt="media"
                        src={optimizedImages[article.id]}
                        className="aspect-square h-full w-full object-cover"
                        fill
                        sizes="100%"
                        placeholder="blur"
                        blurDataURL={placeHolders[article.id]}
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
                              src={article.author.avatar_url ?? ''}
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
            </div>
          ))}
          {articles.featuresPreviously.map((article) => (
            <BlogCard key={article.title} className="flex-col gap-6">
              {article.image && (
                <Link href={`/blog/${article.slug}`} passHref>
                  <BlogCard.Media className="relative w-full h-[26.5rem]">
                    <Image
                      alt="media"
                      src={optimizedImages[article.id]}
                      className="aspect-square h-full w-full object-cover"
                      fill
                      sizes="100%"
                      placeholder="blur"
                      blurDataURL={placeHolders[article.id]}
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
                            src={article.author.avatar_url ?? ''}
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
        <div className="hidden xl:block col-start-10 col-end-13">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
