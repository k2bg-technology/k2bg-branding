import {
  DEFINITION_DIRECTORY_VARIABLE,
  FileSystemDefinitionSource,
  systemClock,
  WarehouseFetchGroupedValuesQueryService,
  WarehouseFetchPeriodBoundsQueryService,
  WarehouseFetchSectionDataQueryService,
  WarehouseFetchSectionReadinessQueryService,
  WarehouseFetchTableRowsQueryService,
} from '../../modules/dashboard/adapters';
import {
  FetchBarsData,
  FetchSectionData,
  FetchTableRows,
  LoadDashboards,
  ResolveDashboardPeriod,
  ResolveSectionGate,
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

export function createResolveSectionGateUseCase(): ResolveSectionGate {
  const client = getWarehouseClient();
  return new ResolveSectionGate(
    new WarehouseFetchPeriodBoundsQueryService(client),
    new WarehouseFetchSectionReadinessQueryService(client)
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

export function createFetchBarsDataUseCase(): FetchBarsData {
  return new FetchBarsData(
    new WarehouseFetchGroupedValuesQueryService(getWarehouseClient())
  );
}
