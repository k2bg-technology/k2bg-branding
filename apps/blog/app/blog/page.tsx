import { Avatar, BlogCard } from 'ui';
import Image from 'next/image';
import Link from 'next/link';

import Notion from '../modules/notion';
import Blog from '../modules/blog';

export default async function Page() {
  const database = await new Notion.Fetcher().fetchDatabase();
  const pages = database.results.map((result) => new Notion.Page(result));
  const articles = new Blog.Articles(pages);

  return (
    <>
      <div className="grid grid-cols-[subgrid] col-span-full border-b-2 py-[30px] border-b-slate-100">
        <div className="col-start-1 col-end-8">
          <BlogCard className="flex-col gap-6">
            <BlogCard.Media className="relative w-full h-[30rem]">
              {articles.featureLatest.image && (
                <Link
                  href={`blog/${articles.featureLatest.slug}` || '#'}
                  passHref
                >
                  <Image
                    alt="media"
                    src={articles.featureLatest.image}
                    className="aspect-square h-full w-full object-cover"
                    fill
                  />
                </Link>
              )}
            </BlogCard.Media>
            <BlogCard.Content
              category={
                <a href="https://example.com" target="_blank" rel="noreferrer">
                  プログラミング
                </a>
              }
              heading={
                <Link href={`blog/${articles.featureLatest.slug}` || '#'}>
                  <h3 className="text-heading-3 font-bold">
                    {articles.featureLatest.title}
                  </h3>
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
        <div className="grid gap-16 col-start-8 col-end-13">
          {articles.featuresRecently.map((article) => (
            <BlogCard key={article.title} className="flex-row gap-8">
              <BlogCard.Media className="relative flex-none max-w-[16rem] max-h-[16rem]">
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
                  <a
                    href="https://example.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    プログラミング
                  </a>
                }
                heading={
                  <Link href={`blog/${article.slug}` || '#'}>
                    <h3 className="text-heading-3 font-bold">
                      {article.title}
                    </h3>
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
      <div className="grid grid-cols-[subgrid] col-span-full py-[30px]">
        <div className="grid grid-cols-2 gap-12 col-start-1 col-end-10">
          {articles.featuresPreviously.map((article) => (
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
                  <a
                    href="https://example.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    プログラミング
                  </a>
                }
                heading={
                  <Link href={`blog/${article.slug}` || '#'}>
                    <h3 className="text-heading-3 font-bold">
                      {article.title}
                    </h3>
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
        <article className="col-start-10 col-end-13 h-[500px] bg-slate-100">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt
          doloribus, eligendi rem perferendis provident error enim omnis quis
          fuga voluptatibus saepe vel dolore dignissimos temporibus quidem, ut
          quam minima. Autem!
        </article>
      </div>
    </>
  );
}
