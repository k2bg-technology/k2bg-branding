import {
  type DashboardDefinition,
  DEFAULT_DASHBOARD_LABELS,
} from '../../modules/dashboard/domain';

interface Props {
  dashboard: DashboardDefinition;
}

export function SectionSelectionRequired({ dashboard }: Props) {
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };
  return (
    <div className="flex flex-col gap-condensed text-body-r-sm text-base-black/80">
      <p>{labels.selectionRequired}</p>
    </div>
  );
}
