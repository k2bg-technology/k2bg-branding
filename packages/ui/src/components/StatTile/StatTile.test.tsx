import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatTile, StatTileSentiment, StatTileTrend } from '.';

describe('StatTile', () => {
  it('shows the label and the formatted value', () => {
    const label = 'Portfolio value';
    const value = '¥12,480,000';

    render(<StatTile label={label} value={value} />);

    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText(value)).toBeInTheDocument();
  });

  it('shows the delta label when a delta is given', () => {
    const delta = { label: '+3.2%', trend: StatTileTrend.UP };

    render(<StatTile label="Portfolio value" value="¥1" delta={delta} />);

    expect(screen.getByText(delta.label)).toBeInTheDocument();
  });

  it('omits the delta badge when no delta is given', () => {
    const { container } = render(
      <StatTile label="Portfolio value" value="¥1" />
    );

    expect(
      container.querySelector('[data-slot="stat-tile-delta"]')
    ).not.toBeInTheDocument();
  });

  it.each`
    trend
    ${StatTileTrend.UP}
    ${StatTileTrend.DOWN}
    ${StatTileTrend.FLAT}
  `('exposes the $trend trend on the delta badge', ({ trend }) => {
    const { container } = render(
      <StatTile
        label="Portfolio value"
        value="¥1"
        delta={{ label: '±0', trend }}
      />
    );

    const badge = container.querySelector('[data-slot="stat-tile-delta"]');
    expect(badge).toHaveAttribute('data-trend', trend);
  });

  it.each`
    trend                 | sentiment
    ${StatTileTrend.UP}   | ${StatTileSentiment.POSITIVE}
    ${StatTileTrend.DOWN} | ${StatTileSentiment.NEGATIVE}
    ${StatTileTrend.FLAT} | ${StatTileSentiment.NEUTRAL}
  `(
    'derives the $sentiment sentiment from the $trend trend',
    ({ trend, sentiment }) => {
      const { container } = render(
        <StatTile
          label="Portfolio value"
          value="¥1"
          delta={{ label: '±0', trend }}
        />
      );

      const badge = container.querySelector('[data-slot="stat-tile-delta"]');
      expect(badge).toHaveAttribute('data-sentiment', sentiment);
    }
  );

  it('uses the explicit sentiment over the trend-derived one', () => {
    const delta = {
      label: '-8.1%',
      trend: StatTileTrend.DOWN,
      sentiment: StatTileSentiment.POSITIVE,
    };

    const { container } = render(
      <StatTile label="Monthly expenses" value="¥1" delta={delta} />
    );

    const badge = container.querySelector('[data-slot="stat-tile-delta"]');
    expect(badge).toHaveAttribute('data-sentiment', delta.sentiment);
  });

  it('renders the description when given', () => {
    const description = 'vs. previous month';

    render(
      <StatTile label="Portfolio value" value="¥1" description={description} />
    );

    expect(screen.getByText(description)).toBeInTheDocument();
  });
});
