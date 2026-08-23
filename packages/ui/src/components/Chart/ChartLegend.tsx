export interface ChartLegendItem {
  id: string;
  label: string;
  color: string;
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
          <span
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-xs"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
