import type { DashboardDefinition } from '../../modules/dashboard/domain';
import { DEFAULT_DASHBOARD_LABELS } from '../../modules/dashboard/domain';

interface Props {
  dashboard: DashboardDefinition;
}

export function SectionTooLarge({ dashboard }: Props) {
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };
  return (
    <p className="text-body-r-sm text-base-black/80">
      {labels.cellBudgetExceeded}
    </p>
  );
}
