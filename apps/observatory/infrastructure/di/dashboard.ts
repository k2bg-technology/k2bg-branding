import {
  DEFINITION_DIRECTORY_VARIABLE,
  FileSystemDefinitionSource,
  systemClock,
  WarehouseFetchPeriodBoundsQueryService,
  WarehouseFetchSectionDataQueryService,
  WarehouseFetchTableRowsQueryService,
} from '../../modules/dashboard/adapters';
import {
  FetchSectionData,
  FetchTableRows,
  LoadDashboards,
  ResolveDashboardPeriod,
} from '../../modules/dashboard/use-cases';
import { getWarehouseClient } from '../warehouse';

export function createLoadDashboardsUseCase(): LoadDashboards {
  return new LoadDashboards(
    new FileSystemDefinitionSource(process.env[DEFINITION_DIRECTORY_VARIABLE])
  );
}

export function createResolveDashboardPeriodUseCase(): ResolveDashboardPeriod {
  return new ResolveDashboardPeriod(
    new WarehouseFetchPeriodBoundsQueryService(getWarehouseClient()),
    systemClock
  );
}

export function createFetchSectionDataUseCase(): FetchSectionData {
  return new FetchSectionData(
    new WarehouseFetchSectionDataQueryService(getWarehouseClient())
  );
}

export function createFetchTableRowsUseCase(): FetchTableRows {
  return new FetchTableRows(
    new WarehouseFetchTableRowsQueryService(getWarehouseClient())
  );
}
