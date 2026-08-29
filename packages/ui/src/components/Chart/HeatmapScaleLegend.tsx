import {
  type HeatmapScaleLabels,
  heatmapCellColor,
  heatmapFilledLevels,
} from './chartHeatmapScale';
import type { ChartColor } from './types';

interface Props {
  color: ChartColor;
  labels: HeatmapScaleLabels;
}

export function HeatmapScaleLegend({ color, labels }: Props) {
  return (
    <div
      data-slot="heatmap-scale-legend"
      className="flex items-center gap-1 text-caption text-base-black/80"
    >
      {labels.less}
      {heatmapFilledLevels.map((level) => (
        <span
          key={level}
          aria-hidden
          className="h-3 w-3 shrink-0 rounded-xs"
          style={{ backgroundColor: heatmapCellColor(level, color) }}
        />
      ))}
      {labels.more}
    </div>
  );
}
