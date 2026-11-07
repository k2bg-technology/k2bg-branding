import { Table } from 'ui';

import type {
  DashboardDefinition,
  ScatterSection as ScatterSectionDefinition,
} from '../../../modules/dashboard/domain';
import { DEFAULT_DASHBOARD_LABELS } from '../../../modules/dashboard/domain';
import { formatValue } from '../formatValue';
import type { ScatterChartInput } from '../scatterChart';
import { ScatterSectionChart } from './ScatterSectionChart';

interface Props {
  dashboard: DashboardDefinition;
  section: ScatterSectionDefinition;
  chart: ScatterChartInput;
}

export function ScatterSection({ dashboard, section, chart }: Props) {
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };
  // Four significant digits keep coefficients readable when axis formats round small values to zero.
  const coefficientFormat = new Intl.NumberFormat(dashboard.locale, {
    maximumSignificantDigits: 4,
  });
  const trendLine = chart.trendLine;
  return (
    <div className="flex flex-col gap-condensed">
      {chart.truncated && <p>{labels.pointsTruncated}</p>}
      <ScatterSectionChart
        label={section.title}
        series={chart.series}
        trendLine={trendLine}
        x={section.x}
        y={section.y}
        locale={dashboard.locale}
        currency={dashboard.currency}
      />
      <div className="sr-only [&_[data-slot=table-container]]:overflow-visible">
        <Table>
          <Table.Caption>{section.title}</Table.Caption>
          <Table.Header>
            <Table.Row>
              {section.series !== undefined && (
                <Table.Head scope="col">{section.series.label}</Table.Head>
              )}
              <Table.Head scope="col">{section.x.label}</Table.Head>
              <Table.Head scope="col">{section.y.label}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {chart.series.flatMap((series) =>
              series.points.map((point, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: duplicate coordinates are valid and rows have no local state.
                <Table.Row key={`${series.id}-${index}`}>
                  {section.series !== undefined && (
                    <Table.Head scope="row">{series.label}</Table.Head>
                  )}
                  <Table.Cell>
                    {formatValue(point.x, section.x, dashboard)}
                  </Table.Cell>
                  <Table.Cell>
                    {formatValue(point.y, section.y, dashboard)}
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>
      {trendLine !== null && (
        <p className="text-body-r-sm text-base-black/80">
          {`${labels.trendLine}: ${section.y.label} = ${coefficientFormat.format(trendLine.slope)} × ${section.x.label} ${trendLine.intercept < 0 ? '-' : '+'} ${coefficientFormat.format(Math.abs(trendLine.intercept))}`}
        </p>
      )}
    </div>
  );
}
