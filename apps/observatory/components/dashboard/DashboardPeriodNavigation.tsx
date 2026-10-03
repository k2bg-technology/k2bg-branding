import { dashboardLogger } from '../../modules/dashboard/adapters/shared';
import {
  type DashboardDefinition,
  DEFAULT_DASHBOARD_LABELS,
  serializeUrlState,
  type UrlState,
  withPeriod,
} from '../../modules/dashboard/domain';
import type { DashboardPeriodResolution } from '../../modules/dashboard/use-cases';
import { PeriodNavigation } from './PeriodNavigation';

interface Props {
  dashboard: DashboardDefinition;
  state: UrlState;
  periodResolution: Promise<DashboardPeriodResolution | null>;
}

export async function DashboardPeriodNavigation({
  dashboard,
  state,
  periodResolution,
}: Props) {
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };
  try {
    const resolution = await periodResolution;
    if (resolution === null) {
      return null;
    }
    return (
      <PeriodNavigation
        label={resolution.period.label(dashboard.locale)}
        labels={labels}
        previousHref={
          resolution.previousTarget === null
            ? undefined
            : `?${serializeUrlState(withPeriod(state, resolution.previousTarget))}`
        }
        nextHref={
          resolution.nextTarget === null
            ? undefined
            : `?${serializeUrlState(withPeriod(state, resolution.nextTarget))}`
        }
      />
    );
  } catch (error) {
    dashboardLogger.error(
      { err: error, dashboardId: dashboard.id },
      'Failed to resolve dashboard period'
    );
    return (
      <PeriodNavigation
        label={
          state.period === null
            ? labels.period
            : state.period.label(dashboard.locale)
        }
        labels={labels}
      />
    );
  }
}
