import type {
  DashboardDefinition,
  MatrixHeatmapSection as MatrixHeatmapSectionDefinition,
} from '../../../modules/dashboard/domain';
import { DEFAULT_DASHBOARD_LABELS } from '../../../modules/dashboard/domain';
import type { MatrixGridInput } from '../matrixGrid';
import { MatrixHeatmapSectionChart } from './MatrixHeatmapSectionChart';

interface Props {
  dashboard: DashboardDefinition;
  section: MatrixHeatmapSectionDefinition;
  grid: MatrixGridInput;
}

export function MatrixHeatmapSection({ dashboard, section, grid }: Props) {
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };
  return (
    <MatrixHeatmapSectionChart
      label={section.title}
      rows={grid.rows}
      columns={grid.columns}
      values={grid.values}
      minimum={section.minimum}
      maximum={section.maximum}
      locale={dashboard.locale}
      currency={dashboard.currency}
      format={section.format}
      unit={section.unit}
      emptyLabel={labels.missingValue}
      scaleLabels={section.scaleLabels}
    />
  );
}
