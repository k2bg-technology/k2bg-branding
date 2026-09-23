import { Suspense } from 'react';

import { TableCatalog } from '../../components/table-catalog/TableCatalog';
import {
  createFetchTableCatalogUseCase,
  createLoadDashboardsUseCase,
} from '../../infrastructure';
import { collectDatasetIds } from '../../modules/dashboard/domain/definition';

export const dynamic = 'force-dynamic';

export default function Page() {
  const fetchTableCatalog = async () => {
    const { definitions } = await createLoadDashboardsUseCase().execute();
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
