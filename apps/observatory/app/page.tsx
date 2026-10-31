import Link from 'next/link';
import { Suspense } from 'react';

import { DashboardIndex } from '../components/dashboard-index/DashboardIndex';
import { PageLayout } from '../components/page-layout';
import { createLoadDashboardsUseCase } from '../infrastructure';

export default function Page() {
  const loadDashboards = () => createLoadDashboardsUseCase().execute();

  return (
    <PageLayout>
      <PageLayout.Header title="Dashboards" />
      <PageLayout.Content>
        <Suspense
          fallback={<p className="text-body-r-md">Loading dashboards…</p>}
        >
          <DashboardIndex loadDashboards={loadDashboards} />
        </Suspense>
      </PageLayout.Content>
      <PageLayout.Content>
        <Link
          href="/catalog"
          className="text-body-r-sm underline underline-offset-4"
        >
          Table catalog
        </Link>
      </PageLayout.Content>
    </PageLayout>
  );
}
