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
      <div className="sr-only">
        <table>
          <caption>{section.title}</caption>
          <thead>
            <tr>
              {section.series !== undefined && (
                <th scope="col">{section.series.label}</th>
              )}
              <th scope="col">{section.x.label}</th>
              <th scope="col">{section.y.label}</th>
            </tr>
          </thead>
          <tbody>
            {chart.series.flatMap((series) =>
              series.points.map((point, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: duplicate coordinates are valid and rows have no local state.
                <tr key={`${series.id}-${index}`}>
                  {section.series !== undefined && (
                    <th scope="row">{series.label}</th>
                  )}
                  <td>{formatValue(point.x, section.x, dashboard)}</td>
                  <td>{formatValue(point.y, section.y, dashboard)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {trendLine !== null && (
        <p className="text-body-r-sm text-base-black/80">
          {`${labels.trendLine}: ${section.y.label} = ${coefficientFormat.format(trendLine.slope)} × ${section.x.label} ${trendLine.intercept < 0 ? '-' : '+'} ${coefficientFormat.format(Math.abs(trendLine.intercept))}`}
        </p>
      )}
    </div>
  );
}
