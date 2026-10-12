import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { dashboardDefinitionSchema } from '../../../modules/dashboard/adapters/output/definition-sources/file-system/schemas';
import sampleDashboard from '../../../modules/dashboard/fixtures/sample-dashboard.json';
import type { ScatterData } from '../../../modules/dashboard/use-cases';
import { scatterChart } from '../scatterChart';
import { ScatterSection } from './ScatterSection';

const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const section = (id: string) => {
  const found = dashboard.sections.find((candidate) => candidate.id === id);
  if (found?.kind !== 'scatter') throw new Error('Expected scatter fixture');
  return found;
};
const rows = (label: string) =>
  within(screen.getByRole('table', { name: label }))
    .getAllByRole('row')
    .map((row) =>
      Array.from(
        row.querySelectorAll('th, td'),
        (cell) => cell.textContent ?? ''
      )
    );
const show = (id: string, data: ScatterData) => {
  const selected = section(id);
  render(
    <ScatterSection
      dashboard={dashboard}
      section={selected}
      chart={scatterChart(selected, data, dashboard)}
    />
  );
  return selected;
};

describe('ScatterSection', () => {
  it('lists one row per point grouped by series in text order with the null series labelled and states the trend line', () => {
    const selected = show('balance-by-amount', {
      points: [
        { x: 1200, y: 9800, series: 'reporting' },
        { x: 300, y: 3000, series: null },
        { x: 2, y: 1, series: 'operations' },
        { x: 5, y: 7, series: 'operations' },
      ],
      truncated: false,
      trendLine: { slope: 1.25, intercept: -300 },
    });
    expect(
      screen.getByRole('application', { name: selected.title })
    ).toBeInTheDocument();
    expect(rows(selected.title)).toEqual([
      ['Category', 'Amount', 'Running balance'],
      ['operations', '￥2', '￥1'],
      ['operations', '￥5', '￥7'],
      ['reporting', '￥1,200', '￥9,800'],
      ['No category', '￥300', '￥3,000'],
    ]);
    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent)
    ).toEqual(['operations', 'reporting', 'No category']);
    expect(
      screen.getByText('Fitted line: Running balance = 1.25 × Amount - 300')
    ).toBeInTheDocument();
    expect(screen.queryByText('Older entries are not drawn')).toBeNull();
  });

  it('heads the table with the axes only, formats each axis in its own format, and shows the truncation notice', () => {
    const selected = show('reading-correlation', {
      points: [
        { x: 21.5, y: 55 },
        { x: 18, y: 62 },
      ],
      truncated: true,
      trendLine: null,
    });
    expect(rows(selected.title)).toEqual([
      ['Temperature', 'Humidity'],
      ['21.5 °C', '55%'],
      ['18 °C', '62%'],
    ]);
    expect(screen.getByText('Older entries are not drawn')).toBeInTheDocument();
    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.queryByText(/^Fitted line/)).toBeNull();
  });
});
