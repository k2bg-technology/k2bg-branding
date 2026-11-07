import { Table } from 'ui';

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
      <div className="sr-only [&_[data-slot=table-container]]:overflow-visible">
        <Table>
          <Table.Caption>{section.title}</Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.Head scope="col">{section.categoryLabel}</Table.Head>
              <Table.Head scope="col">{section.value.label}</Table.Head>
              <Table.Head scope="col">{labels.share}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {chart.slices.map((slice) => (
              <Table.Row key={slice.id}>
                <Table.Head scope="row">{slice.label}</Table.Head>
                <Table.Cell>
                  {formatValue(slice.value, section, dashboard)}
                </Table.Cell>
                <Table.Cell>{`${Math.round((slice.value / total) * 100)}%`}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
