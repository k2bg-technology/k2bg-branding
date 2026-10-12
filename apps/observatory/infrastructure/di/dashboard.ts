import {
  DEFINITION_DIRECTORY_VARIABLE,
  FileSystemDefinitionSource,
  systemClock,
  WarehouseFetchGroupedValuesQueryService,
  WarehouseFetchMatrixDataQueryService,
  WarehouseFetchPeriodBoundsQueryService,
  WarehouseFetchPivotDataQueryService,
  WarehouseFetchScatterPointsQueryService,
  WarehouseFetchSectionDataQueryService,
  WarehouseFetchSectionReadinessQueryService,
  WarehouseFetchTableRowsQueryService,
  WarehouseFetchTreemapPartsQueryService,
} from '../../modules/dashboard/adapters';
import {
  FetchBarsData,
  FetchCompositionData,
  FetchMatrixData,
  FetchPivotData,
  FetchScatterData,
  FetchSectionData,
  FetchTableRows,
  FetchTimeSeriesPivot,
  LoadDashboards,
  ResolveControlOptions,
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

export function createResolveControlOptionsUseCase(): ResolveControlOptions {
  const client = getWarehouseClient();
  return new ResolveControlOptions(
    new WarehouseFetchPeriodBoundsQueryService(client),
    new WarehouseFetchGroupedValuesQueryService(client)
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

export function createFetchCompositionDataUseCase(): FetchCompositionData {
  const client = getWarehouseClient();
  return new FetchCompositionData(
    new WarehouseFetchGroupedValuesQueryService(client),
    new WarehouseFetchTreemapPartsQueryService(client),
    new WarehouseFetchSectionDataQueryService(client)
  );
}

export function createFetchMatrixDataUseCase(): FetchMatrixData {
  return new FetchMatrixData(
    new WarehouseFetchMatrixDataQueryService(getWarehouseClient())
  );
}

export function createFetchTimeSeriesPivotUseCase(): FetchTimeSeriesPivot {
  return new FetchTimeSeriesPivot(
    new WarehouseFetchGroupedValuesQueryService(getWarehouseClient())
  );
}

export function createFetchPivotDataUseCase(): FetchPivotData {
  return new FetchPivotData(
    new WarehouseFetchPivotDataQueryService(getWarehouseClient())
  );
}

export function createFetchScatterDataUseCase(): FetchScatterData {
  const client = getWarehouseClient();
  return new FetchScatterData(
    new WarehouseFetchScatterPointsQueryService(client),
    new WarehouseFetchSectionDataQueryService(client)
  );
}
