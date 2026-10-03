import type { ChartLineStyle } from './types';

const dashedStrokePattern = '6 4';

export interface ChartLegendItem {
  id: string;
  label: string;
  color: string;
  /** A dashed entry gets a dashed line marker; anything else keeps the swatch. */
  lineStyle?: ChartLineStyle;
}

interface Props {
  items: ChartLegendItem[];
}

export function ChartLegend({ items }: Props) {
  return (
    <ul
      data-slot="chart-legend"
      className="flex flex-wrap items-center justify-center gap-4 pt-3"
    >
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center gap-1.5 text-caption text-base-black"
        >
          {item.lineStyle === 'dashed' ? (
            <svg
              aria-hidden="true"
              data-slot="chart-legend-dash"
              viewBox="0 0 16 8"
              className="h-2 w-4 shrink-0"
            >
              <line
                x1="0"
                y1="4"
                x2="16"
                y2="4"
                stroke={item.color}
                strokeWidth="2"
                strokeDasharray={dashedStrokePattern}
              />
            </svg>
          ) : (
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-xs"
              style={{ backgroundColor: item.color }}
            />
          )}
          {item.label}
        </li>
      ))}
    </ul>
  );
}
