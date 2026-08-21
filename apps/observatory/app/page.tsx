import { Suspense } from 'react';

import { TableCatalog } from '../components/table-catalog/TableCatalog';
import { createFetchTableCatalogUseCase } from '../infrastructure';

// Warehouse reads are cached by the data cache, not by prerendering: render on
// every request so `next build` never queries the warehouse.
export const dynamic = 'force-dynamic';

export default function Page() {
  const fetchTableCatalog = () => createFetchTableCatalogUseCase().execute();

  return (
    <main className="flex min-h-screen flex-col gap-spacious bg-base-white p-spacious text-base-black">
      <header className="flex flex-col gap-condensed">
        <h1 className="text-heading-1">Observatory</h1>
        <p className="text-body-r-md">
          A dashboard for observing accumulated personal data — finances,
          health, home environment, and web analytics.
        </p>
      </header>
      <section className="flex flex-col gap-normal">
        <h2 className="text-heading-3">Table catalog</h2>
        <Suspense
          fallback={<p className="text-body-r-md">Loading table catalog…</p>}
        >
          <TableCatalog fetchTableCatalog={fetchTableCatalog} />
        </Suspense>
      </section>
    </main>
  );
}
