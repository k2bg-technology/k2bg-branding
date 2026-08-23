import type { ComponentPropsWithoutRef, ReactNode } from 'react';
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

export interface StatTileProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** Name of the measurement, already localized by the consuming app. */
  label: string;
  /** Headline value, already formatted by the consuming app. */
  value: string;
  delta?: StatTileDelta;
  description?: ReactNode;
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

// Text stays base-black: status colors are too light for 12px text on the
// tinted chip, so the tint and the icon carry the sentiment instead.
const sentimentClassNames = {
  positive: 'bg-success/15',
  negative: 'bg-error/15',
  neutral: 'bg-base-light',
} as const;

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
      className={cn(
        'inline-flex items-center gap-normal self-end rounded-sm p-1 text-caption font-medium',
        sentimentClassNames[sentiment]
      )}
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
  className,
  ...rest
}: StatTileProps) {
  return (
    <div
      data-slot="stat-tile"
      className={cn(
        'flex flex-col gap-spacious rounded-lg border border-base-default/20 p-6 text-base-black',
        className
      )}
      {...rest}
    >
      {delta && <DeltaChip delta={delta} />}
      <div>
        <span className="block text-body-r-sm text-base-black/80">{label}</span>
        <p className="flex flex-wrap items-baseline gap-x-normal">
          <span className="text-heading-2 font-medium tabular-nums">
            {value}
          </span>
          {description && (
            <span className="text-caption text-base-black/80">
              {description}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
