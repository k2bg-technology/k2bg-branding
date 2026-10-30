import { Suspense } from 'react';

import { PageLayout } from '../../components/page-layout';
import { TableCatalog } from '../../components/table-catalog/TableCatalog';
import {
  createFetchTableCatalogUseCase,
  createLoadDashboardsUseCase,
} from '../../infrastructure';
import { dashboardLogger } from '../../modules/dashboard/adapters/shared';
import { collectDatasetIds } from '../../modules/dashboard/domain/definition';

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
    <PageLayout>
      <PageLayout.Header title="Table catalog" />
      <PageLayout.Content>
        <Suspense
          fallback={<p className="text-body-r-md">Loading table catalog…</p>}
        >
          <TableCatalog fetchTableCatalog={fetchTableCatalog} />
        </Suspense>
      </PageLayout.Content>
    </PageLayout>
  );
}
