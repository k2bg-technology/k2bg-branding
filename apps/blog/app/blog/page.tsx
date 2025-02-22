import { Avatar, BlogCard } from 'ui';
import Link from 'next/link';

import Sidebar from '../../components/sidebar/Sidebar';
import { CloudinaryImage } from '../../components/cloudinary-image/CloudinaryImage';
import * as Prisma from '../../modules/data-access/prisma';

export default async function Page() {
  const postRepository = new Prisma.Post.Repository();
  const articles = await postRepository.getAllArticles();

  const featureLatest = articles.at(0);
  const featuresRecently = articles.slice(1, 3);
  const featuresPreviously = articles.slice(4, 8);

  return (
    <>
      <div className="col-span-full grid grid-cols-[subgrid]">
        {featureLatest && (
          <div className="col-start-1 col-end-8">
            <BlogCard className="flex-col gap-spacious">
              {featureLatest.imageUrl && (
                <Link
                  href={`/blog/${featureLatest.slug}`}
                  passHref
                  className="peer"
                >
                  <BlogCard.Media className="relative w-full h-[18.75rem]">
                    <CloudinaryImage
                      publicId={featureLatest.id}
                      src={featureLatest.imageUrl}
                      alt="media"
                      className="absolute aspect-square h-full w-full object-cover hover:scale-105 transition-transform"
                      fill
                      sizes="100%"
                      priority
                      quality={30}
                    />
                  </BlogCard.Media>
                </Link>
              )}
              <BlogCard.Content
                category={
                  <Link href={`/category/${featureLatest.category}`}>
                    {featureLatest.category}
                  </Link>
                }
                heading={
                  <Link
                    href={`/blog/${featureLatest.slug}`}
                    className="heading-link"
                  >
                    <h2 className="text-header-2 leading-header-2 font-bold hover:text-base-black/80 hover:underline">
                      {featureLatest.title}
                    </h2>
                  </Link>
                }
                excerpt={featureLatest.excerpt}
                avatar={
                  featureLatest.author && (
                    <Avatar>
                      <Avatar.Image
                        alt="author"
                        src={featureLatest.author.avatarUrl}
                      />
                    </Avatar>
                  )
                }
                date={featureLatest.releaseDate}
                className="peer-hover:[&>.heading-link]:underline peer-hover:[&>.heading-link]:text-base-black/80"
              />
            </BlogCard>
          </div>
        )}
        <div className="col-start-8 col-end-13 hidden xl:grid gap-y-8">
          {featuresRecently.map((article) => (
            <BlogCard key={article.title} className="flex-row gap-spacious">
              {article.imageUrl && (
                <Link
                  href={`/blog/${article.slug}`}
                  passHref
                  className="h-full peer"
                >
                  <BlogCard.Media className="relative flex-none w-[10rem] h-[10rem]">
                    <CloudinaryImage
                      publicId={article.id}
                      alt="media"
                      src={article.imageUrl}
                      className="absolute aspect-square h-full w-full object-cover hover:scale-105 transition-transform"
                      fill
                      sizes="100%"
                      priority
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
                  <Link href={`/blog/${article.slug}`} className="heading-link">
                    <h2 className="text-header-2 leading-header-2 font-bold hover:text-base-black/80 hover:underline">
                      {article.title}
                    </h2>
                  </Link>
                }
                excerpt={article.excerpt}
                avatar={
                  article.author && (
                    <Avatar>
                      <Avatar.Image
                        alt="author"
                        src={article.author?.avatarUrl}
                      />
                    </Avatar>
                  )
                }
                date={article.releaseDate}
                className="peer-hover:[&>.heading-link]:underline peer-hover:[&>.heading-link]:text-base-black/80"
              />
            </BlogCard>
          ))}
        </div>
      </div>
      <hr className="col-span-full border-b-1 border-b-slate-100" />
      <div className="col-span-full grid grid-cols-[subgrid]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 col-start-1 col-end-10 place-content-start">
          {featuresRecently.map((article) => (
            <div key={article.title} className="block xl:hidden">
              <BlogCard className="flex-col gap-spacious">
                {article.imageUrl && (
                  <Link
                    href={`/blog/${article.slug}`}
                    passHref
                    className="h-full peer"
                  >
                    <BlogCard.Media className="relative w-full h-[16rem]">
                      <CloudinaryImage
                        publicId={article.id}
                        src={article.imageUrl}
                        alt="media"
                        className="aspect-square h-full w-full object-cover hover:scale-105 transition-transform"
                        fill
                        sizes="100%"
                        priority
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
                    <Link
                      href={`/blog/${article.slug}`}
                      className="heading-link"
                    >
                      <h2 className="text-header-2 leading-header-2 font-bold hover:text-base-black/80 hover:underline">
                        {article.title}
                      </h2>
                    </Link>
                  }
                  excerpt={article.excerpt}
                  avatar={
                    article.author && (
                      <Avatar>
                        <Avatar.Image
                          alt="author"
                          src={article.author.avatarUrl}
                        />
                      </Avatar>
                    )
                  }
                  date={article.releaseDate}
                  className="peer-hover:[&>.heading-link]:underline peer-hover:[&>.heading-link]:text-base-black/80"
                />
              </BlogCard>
            </div>
          ))}
          {featuresPreviously.map((article) => (
            <BlogCard key={article.title} className="flex-col gap-spacious">
              {article.imageUrl && (
                <Link href={`/blog/${article.slug}`} passHref className="peer">
                  <BlogCard.Media className="relative w-full h-[16rem]">
                    <CloudinaryImage
                      publicId={article.id}
                      src={article.imageUrl}
                      alt="media"
                      className="aspect-square h-full w-full object-cover hover:scale-105 transition-transform"
                      fill
                      sizes="100%"
                      priority
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
                  <Link href={`/blog/${article.slug}`} className="heading-link">
                    <h2 className="text-header-2 leading-header-2 font-bold hover:text-base-black/80 hover:underline">
                      {article.title}
                    </h2>
                  </Link>
                }
                excerpt={article.excerpt}
                avatar={
                  article.author && (
                    <Avatar>
                      <Avatar.Image
                        alt="author"
                        src={article.author.avatarUrl}
                      />
                    </Avatar>
                  )
                }
                date={article.releaseDate}
                className="peer-hover:[&>.heading-link]:underline peer-hover:[&>.heading-link]:text-base-black/80"
              />
            </BlogCard>
          ))}
        </div>
        <div className="hidden xl:flex col-start-10 col-end-13">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
