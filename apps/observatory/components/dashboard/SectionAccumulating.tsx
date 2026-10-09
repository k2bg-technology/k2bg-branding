import type {
  DashboardDefinition,
  SectionBucket,
} from '../../modules/dashboard/domain';
import {
  DEFAULT_DASHBOARD_LABELS,
  formatBucketLabel,
} from '../../modules/dashboard/domain';

interface Props {
  dashboard: DashboardDefinition;
  since: string;
  availableFrom?: SectionBucket;
  note?: string;
}

export function SectionAccumulating({
  dashboard,
  since,
  availableFrom,
  note,
}: Props) {
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };
  return (
    <div className="flex flex-col gap-condensed text-body-r-sm text-base-black/80">
      <p>
        {`${labels.accumulatingSince} ${formatBucketLabel({ grain: 'day', start: { date: since, hour: 0 } }, dashboard.locale)}`}
        {availableFrom &&
          ` · ${labels.availableFrom} ${formatBucketLabel(availableFrom, dashboard.locale)}`}
      </p>
      {note && <p>{note}</p>}
    </div>
  );
}
