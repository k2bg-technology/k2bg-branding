import {
  DEFINITION_DIRECTORY_VARIABLE,
  FileSystemDefinitionSource,
  WarehouseFetchPeriodBoundsQueryService,
  WarehouseFetchSectionDataQueryService,
} from '../../modules/dashboard/adapters';
import {
  FetchPeriodBounds,
  FetchSectionData,
  LoadDashboards,
} from '../../modules/dashboard/use-cases';
import { getWarehouseClient } from '../warehouse';

export function createLoadDashboardsUseCase(): LoadDashboards {
  return new LoadDashboards(
    new FileSystemDefinitionSource(process.env[DEFINITION_DIRECTORY_VARIABLE])
  );
}

export function createFetchPeriodBoundsUseCase(): FetchPeriodBounds {
  return new FetchPeriodBounds(
    new WarehouseFetchPeriodBoundsQueryService(getWarehouseClient())
  );
}

export function createFetchSectionDataUseCase(): FetchSectionData {
  return new FetchSectionData(
    new WarehouseFetchSectionDataQueryService(getWarehouseClient())
  );
}
