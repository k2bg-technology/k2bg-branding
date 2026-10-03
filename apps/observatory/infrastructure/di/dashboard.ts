import {
  DEFINITION_DIRECTORY_VARIABLE,
  FileSystemDefinitionSource,
  systemClock,
  WarehouseFetchPeriodBoundsQueryService,
  WarehouseFetchSectionDataQueryService,
} from '../../modules/dashboard/adapters';
import {
  FetchSectionData,
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
