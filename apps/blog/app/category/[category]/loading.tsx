import { Skeleton } from 'ui';
import { ArticlesSkeleton } from '../../../components/articles/ArticlesSkeleton';
import { PageLayout } from '../../../components/page-layout';

export default function Loading() {
  return (
    <PageLayout>
      <Skeleton.Line className="w-[10rem] h-[1.875rem]" />
      <ArticlesSkeleton />
    </PageLayout>
  );
}
