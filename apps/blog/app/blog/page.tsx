import { Avatar, BlogCard } from 'ui';
import Image from 'next/image';
import Link from 'next/link';

import Notion from '../modules/notion';
import Blog from '../modules/blog';
import Sidebar from '../components/sidebar/Sidebar';

export default async function Page() {
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
  const pages = database.results.map((result) => new Notion.Page(result));
  const articles = new Blog.Articles(pages);

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
                    src={articles.featureLatest.image}
                    className="absolute aspect-square h-full w-full object-cover"
                    fill
                    sizes="100%"
                    priority
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
                  <h2 className="text-heading-2 leading-heading-2 font-bold">
                    {articles.featureLatest.title}
                  </h2>
                </Link>
              }
              excerpt={articles.featureLatest.excerpt}
              avatar={
                <Avatar
                  image={
                    <div className="relative w-full h-full">
                      <Image
                        alt="author"
                        src={articles.featureLatest.avatar.imageUrl}
                        className="aspect-square h-full w-full object-cover"
                        fill
                        sizes="100%"
                      />
                    </div>
                  }
                  name={articles.featureLatest.avatar.name}
                />
              }
              date={articles.featureLatest.date}
            />
          </BlogCard>
        </div>
        <div className="hidden xl:grid gap-16 col-start-8 col-end-13">
          {articles.featuresRecently.map((article) => (
            <BlogCard key={article.title} className="flex-row gap-8">
              {article.image && (
                <Link href={`/blog/${article.slug}`} passHref>
                  <BlogCard.Media className="relative flex-none w-[16rem] h-[16rem]">
                    <Image
                      alt="media"
                      src={article.image}
                      className="aspect-square h-full w-full object-cover"
                      fill
                      sizes="100%"
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
                          sizes="100%"
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
      <div className="grid grid-cols-[subgrid] col-span-full py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 col-start-1 col-end-10 place-content-start">
          {articles.featuresRecently.map((article) => (
            <div key={article.title} className="block xl:hidden">
              <BlogCard className="flex-col gap-6">
                {article.image && (
                  <Link href={`/blog/${article.slug}`} passHref>
                    <BlogCard.Media className="relative w-full h-[26.5rem]">
                      <Image
                        alt="media"
                        src={article.image}
                        className="aspect-square h-full w-full object-cover"
                        fill
                        sizes="100%"
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
                            sizes="100%"
                          />
                        </div>
                      }
                      name={article.avatar.name}
                    />
                  }
                  date={article.date}
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
                      src={article.image}
                      className="aspect-square h-full w-full object-cover"
                      fill
                      sizes="100%"
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
                          sizes="100%"
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
        <div className="hidden xl:block col-start-10 col-end-13">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
