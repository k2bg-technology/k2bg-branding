import { catalogLogger } from '../../modules/catalog/adapters';
import type { TableSummaryOutput } from '../../modules/catalog/use-cases';
import { TableCatalogTable } from './TableCatalogTable';
import { WarehouseUnavailable } from './WarehouseUnavailable';

interface Props {
  fetchTableCatalog: () => Promise<TableSummaryOutput[]>;
}

export async function TableCatalog({ fetchTableCatalog }: Props) {
  try {
    const tables = await fetchTableCatalog();
    return <TableCatalogTable tables={tables} />;
  } catch (error) {
    catalogLogger.error({ err: error }, 'Failed to fetch table catalog');
    return <WarehouseUnavailable />;
  }
}
