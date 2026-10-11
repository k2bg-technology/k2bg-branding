import type {
  DashboardDefinition,
  DonutSection as DonutSectionDefinition,
} from '../../../modules/dashboard/domain';
import { DEFAULT_DASHBOARD_LABELS } from '../../../modules/dashboard/domain';
import type { DonutChartInput } from '../compositionChart';
import { formatValue } from '../formatValue';
import { DonutSectionChart } from './DonutSectionChart';

interface Props {
  dashboard: DashboardDefinition;
  section: DonutSectionDefinition;
  chart: DonutChartInput;
}

export function DonutSection({ dashboard, section, chart }: Props) {
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };
  const total = chart.slices.reduce((sum, slice) => sum + slice.value, 0);
  return (
    <div className="flex flex-col gap-condensed">
      <DonutSectionChart
        label={section.title}
        slices={chart.slices}
        centerValue={chart.centerValue}
        centerLabel={chart.centerLabel}
        locale={dashboard.locale}
        currency={dashboard.currency}
        format={section.format}
        unit={section.unit}
      />
      <div className="sr-only">
        <table>
          <caption>{section.title}</caption>
          <thead>
            <tr>
              <th scope="col">{section.categoryLabel}</th>
              <th scope="col">{section.value.label}</th>
              <th scope="col">{labels.share}</th>
            </tr>
          </thead>
          <tbody>
            {chart.slices.map((slice) => (
              <tr key={slice.id}>
                <th scope="row">{slice.label}</th>
                <td>{formatValue(slice.value, section, dashboard)}</td>
                <td>{`${Math.round((slice.value / total) * 100)}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
