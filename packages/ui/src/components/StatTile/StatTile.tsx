import {
  type ComponentPropsWithoutRef,
  isValidElement,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import { Icon } from '../Icon';

export const StatTileTrend = {
  UP: 'up',
  DOWN: 'down',
  FLAT: 'flat',
} as const;
export type StatTileTrend = (typeof StatTileTrend)[keyof typeof StatTileTrend];

export const StatTileSentiment = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  NEUTRAL: 'neutral',
} as const;
export type StatTileSentiment =
  (typeof StatTileSentiment)[keyof typeof StatTileSentiment];

export interface StatTileDelta {
  /** Display text including its sign, already localized by the consuming app. */
  label: string;
  trend: StatTileTrend;
  /** Overrides the trend-derived color, e.g. a falling expense is positive. */
  sentiment?: StatTileSentiment;
}

interface Props extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** Name of the measurement, already localized by the consuming app. */
  label: string;
  /** Headline value, already formatted by the consuming app. */
  value: string;
  delta?: StatTileDelta;
  description?: ReactNode;
  /** Compact visualization pinned to the bottom edge, e.g. a `Sparkline`. */
  chart?: ReactNode;
}

const trendIconNames = {
  up: 'arrow-trending-up',
  down: 'arrow-trending-down',
  flat: 'minus',
} as const;

const trendSentiments = {
  up: StatTileSentiment.POSITIVE,
  down: StatTileSentiment.NEGATIVE,
  flat: StatTileSentiment.NEUTRAL,
} as const;

// Text stays base-black for contrast; only the icon color carries sentiment.
const sentimentIconColors = {
  positive: 'var(--color-success-dark)',
  negative: 'var(--color-error-dark)',
  neutral: 'var(--color-base-black)',
} as const;

function DeltaChip({ delta }: { delta: StatTileDelta }) {
  const sentiment = delta.sentiment ?? trendSentiments[delta.trend];

  return (
    <span
      data-slot="stat-tile-delta"
      data-trend={delta.trend}
      data-sentiment={sentiment}
      className="col-start-2 row-span-2 row-start-1 inline-flex items-center gap-condensed self-start justify-self-end rounded-md border border-base-default/20 bg-white px-2 py-0.5 text-caption font-medium"
    >
      <Icon
        aria-hidden
        name={trendIconNames[delta.trend]}
        color={sentimentIconColors[sentiment]}
        width={16}
        height={16}
      />
      {delta.label}
    </span>
  );
}

export function StatTile({
  label,
  value,
  delta,
  description,
  chart,
  className,
  ...rest
}: Props) {
  return (
    <div
      data-slot="stat-tile"
      className={cn(
        '@container flex flex-col gap-spacious rounded-xl border border-base-default/15 bg-white p-6 shadow-xs text-base-black',
        className
      )}
      {...rest}
    >
      <div className="grid grid-cols-[1fr_auto] grid-rows-[auto_auto] items-start gap-x-normal gap-y-condensed">
        <span className="col-start-1 row-start-1 text-body-r-sm text-base-black/80">
          {label}
        </span>
        <span className="col-start-1 row-start-2 text-heading-2 font-semibold @xs:text-heading-1 tabular-nums">
          {value}
        </span>
        {delta && <DeltaChip delta={delta} />}
      </div>
      {description && (
        <span className="block text-body-r-sm text-base-black/80">
          {description}
        </span>
      )}
      {isValidElement(chart) && (
        <div data-slot="stat-tile-chart" className="mt-auto">
          {chart}
        </div>
      )}
    </div>
  );
}

export type { Props as StatTileProps };
