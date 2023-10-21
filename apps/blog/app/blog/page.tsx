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

  return <div />;
}
