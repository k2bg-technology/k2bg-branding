import { Suspense } from 'react';

import { SectionSkeleton } from '../../../components/dashboard/SectionSkeleton';
import { DashboardPage } from '../../../components/dashboard-page/DashboardPage';
import { PageLayout } from '../../../components/page-layout';

export default function Page(props: PageProps<'/dashboards/[id]'>) {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <PageLayout.Header title="Dashboard" />
          <PageLayout.Content>
            <SectionSkeleton />
          </PageLayout.Content>
        </PageLayout>
      }
    >
      <DashboardPage {...props} />
    </Suspense>
  );
}
