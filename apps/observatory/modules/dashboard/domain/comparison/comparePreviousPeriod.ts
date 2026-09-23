import type { StatTileDefinition } from '../definition';

type Direction = NonNullable<StatTileDefinition['comparison']>['direction'];

export interface PeriodComparison {
  trend: 'up' | 'down' | 'flat';
  sentiment: 'positive' | 'negative' | null;
  absoluteChange: number;
  relativeChange: number | null;
}

export function comparePreviousPeriod(
  current: number | null,
  previous: number | null,
  direction: Direction
): PeriodComparison | null {
  if (current === null || previous === null) {
    return null;
  }
  const absoluteChange = current - previous;
  const trend = trendFor(absoluteChange);
  const sentiment = sentimentFor(trend, direction);
  return {
    trend,
    sentiment,
    absoluteChange,
    relativeChange: previous > 0 ? absoluteChange / previous : null,
  };
}

function trendFor(change: number): 'up' | 'down' | 'flat' {
  if (change > 0) {
    return 'up';
  }
  return change < 0 ? 'down' : 'flat';
}

function sentimentFor(
  trend: 'up' | 'down' | 'flat',
  direction: Direction
): 'positive' | 'negative' | null {
  if (trend === 'flat' || direction === 'neutral') {
    return null;
  }
  return (trend === 'up') === (direction === 'higher-is-better')
    ? 'positive'
    : 'negative';
}
