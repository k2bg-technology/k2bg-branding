import {
  type CategoryItem,
  type DashboardDefinition,
  type DateBounds,
  type DistinctControlDefinition,
  orderCategories,
  type SourceDefinition,
} from '../../../domain';
import type { FetchGroupedValuesQueryService } from '../fetch-bars-data/queryService';
import type { FetchPeriodBoundsQueryService } from '../resolve-dashboard-period/queryService';

export const MAXIMUM_CONTROL_OPTIONS = 100;

export interface ResolveControlOptionsInput {
  dashboard: DashboardDefinition;
}

export type ControlOptionsOutcome =
  | { status: 'ready'; options: string[]; truncated: boolean }
  | { status: 'unavailable'; error: unknown };
export type ControlOptionsOutcomes = Record<string, ControlOptionsOutcome>;

export class ResolveControlOptions {
  constructor(
    private readonly periodBoundsQueryService: FetchPeriodBoundsQueryService,
    private readonly groupedValuesQueryService: FetchGroupedValuesQueryService
  ) {}

  async execute({
    dashboard,
  }: ResolveControlOptionsInput): Promise<ControlOptionsOutcomes> {
    const controls = (dashboard.controls ?? []).filter(
      (control): control is DistinctControlDefinition =>
        control.options === 'distinct'
    );
    if (controls.length === 0) {
      return {};
    }
    const periodSource =
      dashboard.periodSource ?? dashboard.sections[0]?.source;
    const bounds =
      periodSource === undefined
        ? Promise.resolve(null)
        : this.periodBoundsQueryService.fetchPeriodBounds(
            periodSource,
            dashboard.timeZone,
            {
              name: `dashboard-${dashboard.id}-period-bounds`,
              revalidate: dashboard.revalidate,
            }
          );
    const outcomes = await Promise.all(
      controls.map(
        async (control) =>
          [
            control.id,
            await this.resolveControl(dashboard, control, periodSource, bounds),
          ] as const
      )
    );
    return Object.fromEntries(outcomes);
  }

  private async resolveControl(
    dashboard: DashboardDefinition,
    control: DistinctControlDefinition,
    periodSource: SourceDefinition | undefined,
    bounds: Promise<DateBounds | null>
  ): Promise<ControlOptionsOutcome> {
    try {
      const dateRange = await bounds;
      if (dateRange === null || periodSource === undefined) {
        return { status: 'ready', options: [], truncated: false };
      }
      const data = await this.groupedValuesQueryService.fetchGroupedValues(
        {
          sectionId: control.id,
          source: control.source ?? periodSource,
          timeZone: dashboard.timeZone,
          dateRange,
          measures: control.value === undefined ? [] : [control.value],
          buckets: null,
          category: {
            column: control.column,
            sortKey:
              control.order === 'value-desc' ? null : control.order.sortKey,
          },
        },
        {
          name: `dashboard-${dashboard.id}-control-${control.id}-options`,
          revalidate: dashboard.revalidate,
        }
      );
      if (data === null) {
        return { status: 'ready', options: [], truncated: false };
      }
      if (data.grouping !== 'category') {
        throw new Error('Control options require category grouping');
      }
      const items: CategoryItem[] = data.groups.map((group) => ({
        category: group.category,
        values: group.values,
        sortKey: group.sortKey,
        rank: group.values[0] ?? null,
      }));
      const options = orderCategories(items, control.order).flatMap((item) =>
        item.category === null || item.category === '' ? [] : [item.category]
      );
      return {
        status: 'ready',
        options: options.slice(0, MAXIMUM_CONTROL_OPTIONS),
        truncated: options.length > MAXIMUM_CONTROL_OPTIONS,
      };
    } catch (error) {
      return { status: 'unavailable', error };
    }
  }
}
