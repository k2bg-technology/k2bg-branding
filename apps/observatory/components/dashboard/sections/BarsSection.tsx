import type {
  BarsSection as BarsSectionDefinition,
  DashboardDefinition,
} from '../../../modules/dashboard/domain';
import { DEFAULT_DASHBOARD_LABELS } from '../../../modules/dashboard/domain';
import type { BarsChartInput } from '../barsChart';
import { BarsSectionChart } from './BarsSectionChart';

interface Props {
  dashboard: DashboardDefinition;
  section: BarsSectionDefinition;
  chart: BarsChartInput;
}

export function BarsSection({ dashboard, section, chart }: Props) {
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };
  return (
    <div className="flex flex-col gap-condensed">
      {chart.windowLabel !== null && (
        <p>
          {chart.windowLabel}
          {chart.truncated && ` · ${labels.truncated}`}
        </p>
      )}
      <BarsSectionChart
        label={section.title}
        categories={chart.categories}
        series={chart.series}
        stacked={section.stacked}
        locale={dashboard.locale}
        currency={dashboard.currency}
        format={section.format}
        unit={section.unit}
      />
    </div>
  );
}
