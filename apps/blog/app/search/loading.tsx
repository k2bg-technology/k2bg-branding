import { Skelton } from 'ui';
import { ArticlesSkelton } from '../../components/articles/ArticlesSkelton';
import { PageLayout } from '../../components/page-layout';

export default function Loading() {
  return (
    <PageLayout>
      <Skelton.Line className="w-[10rem] h-[1.875rem]" />
      <ArticlesSkelton />
    </PageLayout>
  );
}
