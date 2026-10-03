import type { ChartTooltipData } from './types';

interface Props {
  data: ChartTooltipData;
}

export function ChartTooltip({ data }: Props) {
  return (
    <div
      data-slot="chart-tooltip"
      className="grid min-w-32 gap-1.5 rounded-lg border border-base-light/50 bg-base-white px-2.5 py-1.5 text-caption shadow-xl"
    >
      <p className="font-medium text-base-black">{data.heading}</p>
      {data.items.map((item) => (
        <div key={item.id} className="flex w-full items-center gap-2">
          <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 rounded-xs"
            style={{ backgroundColor: item.color }}
          />
          <div className="flex flex-1 items-center justify-between gap-4 leading-none">
            <span className="text-base-black/80">{item.label}</span>
            <span className="font-medium text-base-black tabular-nums">
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
