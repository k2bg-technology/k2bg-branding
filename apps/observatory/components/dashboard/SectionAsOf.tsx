import type {
  DashboardDefinition,
  Period,
} from '../../modules/dashboard/domain';
import { DEFAULT_DASHBOARD_LABELS } from '../../modules/dashboard/domain';

interface Props {
  dashboard: DashboardDefinition;
  period: Period;
}

export function SectionAsOf({ dashboard, period }: Props) {
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };
  return (
    <p className="text-body-r-sm text-base-black/80">{`${labels.asOf} ${period.label(dashboard.locale)}`}</p>
  );
}
