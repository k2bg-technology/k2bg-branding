import {
  type HeatmapScaleLabels,
  heatmapCellColor,
  heatmapEmptyCellBackgroundImage,
  heatmapScaleLevels,
} from './chartHeatmapScale';
import type { ChartColor } from './types';

interface Props {
  color: ChartColor;
  labels: HeatmapScaleLabels;
  /** Adds the missing-measurement key; left out when every cell is measured. */
  emptyLabel?: string;
}

export function HeatmapScaleLegend({ color, labels, emptyLabel }: Props) {
  return (
    <div
      data-slot="heatmap-scale-legend"
      className="flex items-center gap-1 text-caption text-base-black/80"
    >
      {labels.less}
      {heatmapScaleLevels.map((level) => (
        <span
          key={level}
          aria-hidden
          className="h-3 w-3 shrink-0 rounded-xs"
          style={{ backgroundColor: heatmapCellColor(level, color) }}
        />
      ))}
      {labels.more}
      {emptyLabel !== undefined && (
        <>
          <span
            aria-hidden
            className="ml-2 h-3 w-3 shrink-0 rounded-xs border border-base-light"
            style={{ backgroundImage: heatmapEmptyCellBackgroundImage }}
          />
          {emptyLabel}
        </>
      )}
    </div>
  );
}
