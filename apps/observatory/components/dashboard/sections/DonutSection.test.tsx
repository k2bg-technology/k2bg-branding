import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { dashboardDefinitionSchema } from '../../../modules/dashboard/adapters/output/definition-sources/file-system/schemas';
import sampleDashboard from '../../../modules/dashboard/fixtures/sample-dashboard.json';
import type { CompositionData } from '../../../modules/dashboard/use-cases';
import { donutChart } from '../compositionChart';
import { DonutSection } from './DonutSection';

const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const donut = (id: string) => {
  const section = dashboard.sections.find((candidate) => candidate.id === id);
  if (section?.kind !== 'donut') throw new Error('Expected donut fixture');
  return section;
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
const show = (id: string, data: CompositionData) => {
  const section = donut(id);
  const result = donutChart(section, data, dashboard);
  if (result.status !== 'ready') throw new Error('Expected drawable donut');
  render(
    <DonutSection
      dashboard={dashboard}
      section={section}
      chart={result.chart}
    />
  );
  return section;
};

describe('DonutSection', () => {
  it('shows the slice total in the centre and lists slices largest first with the null category labelled', () => {
    const section = show('spending-share', {
      parts: [
        { category: 'Food', value: 200 },
        { category: 'Rent', value: 300 },
        { category: null, value: 100 },
      ],
      center: null,
    });

    expect(
      screen.getByRole('application', { name: section.title })
    ).toBeInTheDocument();
    expect(screen.getByText('￥600')).toBeInTheDocument();
    expect(screen.getByText('Total spending')).toBeInTheDocument();
    expect(rows(section.title)).toEqual([
      ['Category', 'Amount', 'Share of total'],
      ['Rent', '￥300', '50%'],
      ['Food', '￥200', '33%'],
      ['No category', '￥100', '17%'],
    ]);
    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent)
    ).toEqual(['Rent', 'Food', 'No category']);
  });

  it('folds categories past the top three into a last remainder and gives a category without an amount no slice', () => {
    const section = show('spending-share', {
      parts: [
        { category: 'Rent', value: 300 },
        { category: 'Food', value: 200 },
        { category: 'Fun', value: 100 },
        { category: 'Books', value: 50 },
        { category: 'Tea', value: null },
      ],
      center: null,
    });

    expect(rows(section.title)).toEqual([
      ['Category', 'Amount', 'Share of total'],
      ['Rent', '￥300', '46%'],
      ['Food', '￥200', '31%'],
      ['Fun', '￥100', '15%'],
      ['Other categories', '￥50', '8%'],
    ]);
    expect(screen.getByText('￥650')).toBeInTheDocument();
    expect(screen.queryByText('Tea')).toBeNull();
  });

  it.each([
    { name: 'the latest value', center: 9800, expected: '￥9,800' },
    { name: 'the null value', center: null, expected: '—' },
  ])(
    'shows $name in the centre of a centre-column donut and orders slices by the sort key',
    ({ center, expected }) => {
      const section = show('weekday-share', {
        parts: [
          { category: 'Tue', value: 200, sortKey: 2 },
          { category: 'Mon', value: 100, sortKey: 1 },
        ],
        center,
      });

      expect(screen.getByText(expected)).toBeInTheDocument();
      expect(screen.getByText('Latest balance')).toBeInTheDocument();
      expect(rows(section.title)).toEqual([
        ['Weekday', 'Amount', 'Share of total'],
        ['Mon', '￥100', '33%'],
        ['Tue', '￥200', '67%'],
      ]);
    }
  );
});
