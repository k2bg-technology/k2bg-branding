import { WarehouseFetchTableCatalogQueryService } from '../../modules/catalog/adapters';
import { FetchTableCatalog } from '../../modules/catalog/use-cases';
import { getWarehouseClient, getWarehouseLocation } from '../warehouse';

export function createFetchTableCatalogUseCase(): FetchTableCatalog {
  const client = getWarehouseClient();
  const location = getWarehouseLocation();
  return new FetchTableCatalog(
    new WarehouseFetchTableCatalogQueryService(client, location)
  );
}
