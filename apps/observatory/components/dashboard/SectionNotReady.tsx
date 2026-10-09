import type { DashboardDefinition } from '../../modules/dashboard/domain';
import { DEFAULT_DASHBOARD_LABELS } from '../../modules/dashboard/domain';

interface Props {
  dashboard: DashboardDefinition;
  note?: string;
}

export function SectionNotReady({ dashboard, note }: Props) {
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };
  return (
    <div className="flex flex-col gap-condensed text-body-r-sm text-base-black/80">
      <p>{labels.notReady}</p>
      {note && <p>{note}</p>}
    </div>
  );
}
