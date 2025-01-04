import { Markdown } from '../../../../components/markdown';
import Sidebar from '../../../../components/sidebar/Sidebar';
import { ArticleHeading } from '../../../../components/article-heading/ArticleHeading';
import * as Prisma from '../../../../modules/data-access/prisma';

export const revalidate = 3600;

export async function generateStaticParams() {
  const postRepository = new Prisma.Post.Repository();
  const posts = await postRepository.getAllArticleSlugs();

  return posts.map((post) => ({
    id: post.id,
    slug: post.slug,
  }));
}

export default async function Page({
  params,
}: {
  params: { id: string; slug: string };
}) {
  const postRepository = new Prisma.Post.Repository();
  const article = await postRepository.getPost(params.id);

  return (
    <>
      <div className="grid-cols-[subgrid] gap-20 col-span-full">
        <ArticleHeading article={article} />
      </div>
      <div className="grid grid-cols-[subgrid] col-span-full">
        <div className="col-start-1 col-end-10">
          <Markdown article={article} />
        </div>
        <div className="hidden xl:block col-start-10 col-end-13">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
