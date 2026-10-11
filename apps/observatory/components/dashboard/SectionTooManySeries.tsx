import type { DashboardDefinition } from '../../modules/dashboard/domain';
import { DEFAULT_DASHBOARD_LABELS } from '../../modules/dashboard/domain';

interface Props {
  dashboard: DashboardDefinition;
  count: number;
  maximum: number;
}

export function SectionTooManySeries({ dashboard, count, maximum }: Props) {
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };
  return (
    <p className="text-body-r-sm text-base-black/80">{`${labels.tooManySeries} (${count} / ${maximum})`}</p>
  );
}
