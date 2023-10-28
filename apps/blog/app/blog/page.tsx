import { Client } from '@notionhq/client';
import { Avatar, BlogCard } from 'ui';
import Image from 'next/image';
import Link from 'next/link';

import { createPagePropertyMap, isPageObject } from '../modules/post/domain';

const notion = new Client({
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  auth: process.env.NOTION_TOKEN ?? '',
});

export default async function Page() {
  const response = await notion.databases.query({
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    database_id: process.env.NOTION_DATABASE_ID ?? '',
  });

  const posts = response.results.flatMap<{
    title: string | undefined;
    excerpt: string | undefined;
    image: string | undefined;
    slug: string | undefined;
    status: string | undefined;
    date: string | undefined;
    author?: string | undefined;
  }>((result) => {
    if (!isPageObject(result)) return [];

    const pagePropertyMap = createPagePropertyMap(result);
    const { id } = result;
    const params = new URLSearchParams({
      id,
    });

    const content = pagePropertyMap.get(result.properties.content.id, 'title');
    const excerpt = pagePropertyMap.get(
      result.properties.excerpt.id,
      'rich_text'
    );
    const slug = pagePropertyMap.get(result.properties.slug.id, 'rich_text');
    const image = pagePropertyMap.get(result.properties.image.id, 'files');
    const status = pagePropertyMap.get(result.properties.status.id, 'status');
    const date = pagePropertyMap.get(result.properties.date.id, 'created_time');

    return {
      title: content?.title.map((title) => title.plain_text).join(' '),
      excerpt: excerpt?.rich_text
        .flatMap((text) => ('text' in text ? text.plain_text : []))
        .join(' '),
      image: image?.files
        .flatMap((file) => ('file' in file ? file.file.url : []))
        .join(' '),
      slug: `blog/${slug?.rich_text
        .flatMap((text) => ('text' in text ? text.plain_text : []))
        .join(' ')}?${params}`,
      status:
        status?.status && 'name' in status.status
          ? status.status.name
          : undefined,
      date:
        typeof date?.created_time === 'string' ? date.created_time : undefined,
    };
  });

  return (
    <>
      <div className="grid grid-cols-[subgrid] col-span-full border-b-2 py-[30px] border-b-slate-100">
        <div className="col-start-1 col-end-8">
          <BlogCard className="flex-col gap-6">
            <BlogCard.Media className="relative w-full h-[30rem]">
              {posts[0].image && (
                <Link href={posts[0].slug || '#'} passHref>
                  <Image
                    alt="media"
                    src={posts[0].image}
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
                <Link href={posts[0].slug || '#'}>
                  <h3 className="text-heading-3 font-bold">{posts[0].title}</h3>
                </Link>
              }
              excerpt={posts[0].excerpt}
              avatar={
                <Avatar
                  image={
                    <div className="relative w-full h-full">
                      <Image
                        alt="author"
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=2080&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        className="aspect-square h-full w-full object-cover"
                        fill
                      />
                    </div>
                  }
                  name="Kuroda Kentaro"
                />
              }
              date="September 30, 2023"
            />
          </BlogCard>
        </div>
        <div className="grid gap-16 col-start-8 col-end-13">
          <BlogCard className="flex-row gap-8">
            <BlogCard.Media className="flex-none max-w-[16rem]">
              <a href="https://example.com" target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Office"
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                />
              </a>
            </BlogCard.Media>
            <BlogCard.Content
              category={
                <a href="https://example.com" target="_blank" rel="noreferrer">
                  プログラミング
                </a>
              }
              heading={
                <a href="https://example.com" target="_blank" rel="noreferrer">
                  <h3 className="text-heading-3 font-bold">記事のタイトル</h3>
                </a>
              }
              excerpt="記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋..."
              avatar={
                <Avatar
                  image={
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt="Office"
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=2080&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    />
                  }
                  name="Kuroda Kentaro"
                />
              }
              date="September 30, 2023"
            />
          </BlogCard>
          <BlogCard className="flex-row gap-8">
            <BlogCard.Media className="flex-none max-w-[16rem]">
              <a href="https://example.com" target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Office"
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                />
              </a>
            </BlogCard.Media>
            <BlogCard.Content
              category={
                <a href="https://example.com" target="_blank" rel="noreferrer">
                  プログラミング
                </a>
              }
              heading={
                <a href="https://example.com" target="_blank" rel="noreferrer">
                  <h3 className="text-heading-3 font-bold">記事のタイトル</h3>
                </a>
              }
              excerpt="記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋..."
              avatar={
                <Avatar
                  image={
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt="Office"
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=2080&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    />
                  }
                  name="Kuroda Kentaro"
                />
              }
              date="September 30, 2023"
            />
          </BlogCard>
          <BlogCard className="flex-row gap-8">
            <BlogCard.Media className="flex-none max-w-[16rem]">
              <a href="https://example.com" target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Office"
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                />
              </a>
            </BlogCard.Media>
            <BlogCard.Content
              category={
                <a href="https://example.com" target="_blank" rel="noreferrer">
                  プログラミング
                </a>
              }
              heading={
                <a href="https://example.com" target="_blank" rel="noreferrer">
                  <h3 className="text-heading-3 font-bold">記事のタイトル</h3>
                </a>
              }
              excerpt="記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋..."
              avatar={
                <Avatar
                  image={
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt="Office"
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=2080&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    />
                  }
                  name="Kuroda Kentaro"
                />
              }
              date="September 30, 2023"
            />
          </BlogCard>
        </div>
      </div>
      <div className="grid grid-cols-[subgrid] col-span-full py-[30px]">
        <div className="grid grid-cols-2 gap-12 col-start-1 col-end-10">
          <BlogCard className="flex-col gap-6">
            <BlogCard.Media>
              <a href="https://example.com" target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Office"
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                />
              </a>
            </BlogCard.Media>
            <BlogCard.Content
              category={
                <a href="https://example.com" target="_blank" rel="noreferrer">
                  プログラミング
                </a>
              }
              heading={
                <a href="https://example.com" target="_blank" rel="noreferrer">
                  <h3 className="text-heading-3 font-bold">記事のタイトル</h3>
                </a>
              }
              excerpt="記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋..."
              avatar={
                <Avatar
                  image={
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt="Office"
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=2080&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    />
                  }
                  name="Kuroda Kentaro"
                />
              }
              date="September 30, 2023"
            />
          </BlogCard>
          <BlogCard className="flex-col gap-6">
            <BlogCard.Media>
              <a href="https://example.com" target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Office"
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                />
              </a>
            </BlogCard.Media>
            <BlogCard.Content
              category={
                <a href="https://example.com" target="_blank" rel="noreferrer">
                  プログラミング
                </a>
              }
              heading={
                <a href="https://example.com" target="_blank" rel="noreferrer">
                  <h3 className="text-heading-3 font-bold">記事のタイトル</h3>
                </a>
              }
              excerpt="記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋..."
              avatar={
                <Avatar
                  image={
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt="Office"
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=2080&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    />
                  }
                  name="Kuroda Kentaro"
                />
              }
              date="September 30, 2023"
            />
          </BlogCard>
          <BlogCard className="flex-col gap-6">
            <BlogCard.Media>
              <a href="https://example.com" target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Office"
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                />
              </a>
            </BlogCard.Media>
            <BlogCard.Content
              category={
                <a href="https://example.com" target="_blank" rel="noreferrer">
                  プログラミング
                </a>
              }
              heading={
                <a href="https://example.com" target="_blank" rel="noreferrer">
                  <h3 className="text-heading-3 font-bold">記事のタイトル</h3>
                </a>
              }
              excerpt="記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋..."
              avatar={
                <Avatar
                  image={
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt="Office"
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=2080&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    />
                  }
                  name="Kuroda Kentaro"
                />
              }
              date="September 30, 2023"
            />
          </BlogCard>
          <BlogCard className="flex-col gap-6">
            <BlogCard.Media>
              <a href="https://example.com" target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Office"
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                />
              </a>
            </BlogCard.Media>
            <BlogCard.Content
              category={
                <a href="https://example.com" target="_blank" rel="noreferrer">
                  プログラミング
                </a>
              }
              heading={
                <a href="https://example.com" target="_blank" rel="noreferrer">
                  <h3 className="text-heading-3 font-bold">記事のタイトル</h3>
                </a>
              }
              excerpt="記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋..."
              avatar={
                <Avatar
                  image={
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt="Office"
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=2080&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    />
                  }
                  name="Kuroda Kentaro"
                />
              }
              date="September 30, 2023"
            />
          </BlogCard>
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
