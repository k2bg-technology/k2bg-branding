import Link from 'next/link';
import { Suspense } from 'react';

import { DashboardIndex } from '../components/dashboard-index/DashboardIndex';
import { createLoadDashboardsUseCase } from '../infrastructure';

export const dynamic = 'force-dynamic';

export default function Page() {
  const loadDashboards = () => createLoadDashboardsUseCase().execute();

  return (
    <main className="flex min-h-screen flex-col gap-spacious bg-base-white p-spacious text-base-black">
      <h1 className="text-heading-1">Dashboards</h1>
      <Suspense
        fallback={<p className="text-body-r-md">Loading dashboards…</p>}
      >
        <DashboardIndex loadDashboards={loadDashboards} />
      </Suspense>
      <Link
        href="/catalog"
        className="text-body-r-sm underline underline-offset-4"
      >
        Table catalog
      </Link>
    </main>
  );
}
