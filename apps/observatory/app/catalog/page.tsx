import { Suspense } from 'react';

import { TableCatalog } from '../../components/table-catalog/TableCatalog';
import {
  createFetchTableCatalogUseCase,
  createLoadDashboardsUseCase,
} from '../../infrastructure';
import { dashboardLogger } from '../../modules/dashboard/adapters/shared';
import { collectDatasetIds } from '../../modules/dashboard/domain/definition';

export const dynamic = 'force-dynamic';

export default function Page() {
  const fetchTableCatalog = async () => {
    const { definitions, issues } =
      await createLoadDashboardsUseCase().execute();
    issues.forEach((issue) => {
      dashboardLogger.warn({ issue }, 'Dashboard definition issue');
    });
    // A partially loaded definition set would silently list too few datasets.
    if (issues.length > 0) {
      throw new Error('Dashboard definitions could not be fully loaded');
    }
    return createFetchTableCatalogUseCase().execute({
      datasetIds: collectDatasetIds(definitions),
    });
  };

  return (
    <main className="flex min-h-screen flex-col gap-spacious bg-base-white p-spacious text-base-black">
      <h1 className="text-heading-1">Table catalog</h1>
      <Suspense
        fallback={<p className="text-body-r-md">Loading table catalog…</p>}
      >
        <TableCatalog fetchTableCatalog={fetchTableCatalog} />
      </Suspense>
    </main>
  );
}
