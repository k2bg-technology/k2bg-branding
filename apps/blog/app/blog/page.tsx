import { Client } from '@notionhq/client';

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

  console.log(posts);

  return (
    <>
      <div className="grid grid-cols-[subgrid] col-span-full border-b-2 py-[30px] border-b-slate-100">
        <article className="col-start-1 col-end-8 h-[500px] bg-slate-100">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime error
          tempore quae distinctio sequi sed officia veritatis facilis harum eos
          tenetur iste doloribus molestias reiciendis, iusto non quisquam unde
          quaerat.
        </article>
        <article className="flex flex-col gap-10 col-start-8 col-end-13 bg-slate-100">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. A esse eos
          doloribus nihil nam repellendus impedit placeat voluptate cum mollitia
          pariatur sit blanditiis, dicta in quis maiores natus, optio ad!
        </article>
      </div>
      <div className="grid grid-cols-[subgrid] col-span-full py-[30px]">
        <div className="col-start-1 col-end-10 h-[500px] bg-slate-100">
          <article>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Rerum
            voluptate iusto, maiores, non eveniet magni modi et praesentium
            molestiae vel qui vero aliquam quia quas ipsa, sequi inventore?
            Excepturi, corporis!
          </article>
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
