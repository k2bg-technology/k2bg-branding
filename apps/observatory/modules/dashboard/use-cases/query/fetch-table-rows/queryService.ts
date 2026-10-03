import type { TableQueryPlan } from '../../../domain';
import type { QueryOptions, TableRows } from '../../shared';

export interface FetchTableRowsQueryService {
  fetchTableRows(
    plan: TableQueryPlan,
    options: QueryOptions
  ): Promise<TableRows | null>;
}
