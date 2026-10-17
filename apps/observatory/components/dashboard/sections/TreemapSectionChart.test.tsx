import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { dashboardDefinitionSchema } from '../../../modules/dashboard/adapters/output/definition-sources/file-system/schemas';
import type { TreemapSection } from '../../../modules/dashboard/domain';
import sampleDashboard from '../../../modules/dashboard/fixtures/sample-dashboard.json';
import type { CompositionData } from '../../../modules/dashboard/use-cases';
import { treemapChart } from '../compositionChart';
import { TreemapSectionChart } from './TreemapSectionChart';

const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const fixture = dashboard.sections.find(
  (section) => section.id === 'category-tree'
);
if (fixture?.kind !== 'treemap') throw new Error('Expected treemap fixture');
const rows = (label: string) =>
  within(screen.getByRole('table', { name: label }))
    .getAllByRole('row')
    .map((row) =>
      Array.from(
        row.querySelectorAll('th, td'),
        (cell) => cell.textContent ?? ''
      )
    );
const show = (section: TreemapSection, data: CompositionData) => {
  const result = treemapChart(section, data, dashboard);
  if (result.status !== 'ready') throw new Error('Expected drawable treemap');
  render(
    <TreemapSectionChart
      label={section.title}
      nodes={result.chart.nodes}
      tableHeaders={result.chart.tableHeaders}
      locale={dashboard.locale}
      currency={dashboard.currency}
      format={section.format}
      unit={section.unit}
    />
  );
};

describe('TreemapSectionChart', () => {
  it('folds each group past its top two, orders groups by total, labels the null group, and heads the table from the definition', () => {
    show(fixture, {
      parts: [
        { group: 'Daily', category: 'Food', value: 300 },
        { group: 'Home', category: 'Water', value: 50 },
        { group: 'Home', category: 'Rent', value: 600 },
        { group: 'Home', category: 'Gas', value: 50 },
        { group: 'Home', category: 'Power', value: 100 },
        { group: 'Daily', category: 'Tea', value: null },
        { group: null, category: 'Misc', value: 100 },
      ],
      center: null,
    });

    expect(rows(fixture.title)).toEqual([
      ['Group', 'Category', 'Amount', 'Share of total'],
      ['Home', 'Rent', '￥600', '50%'],
      ['Home', 'Power', '￥100', '8%'],
      ['Home', 'Other categories', '￥100', '8%'],
      ['Daily', 'Food', '￥300', '25%'],
      ['No category', 'Misc', '￥100', '8%'],
    ]);
    expect(
      screen.getByRole('application', { name: fixture.title })
    ).toBeInTheDocument();
  });

  it('draws an ungrouped treemap without a group column', () => {
    const section = {
      ...fixture,
      group: undefined,
      groupLabel: undefined,
      topN: undefined,
    };
    show(section, {
      parts: [
        { category: 'Rent', value: 600 },
        { category: 'Food', value: 200 },
      ],
      center: null,
    });

    expect(rows(section.title)).toEqual([
      ['Category', 'Amount', 'Share of total'],
      ['Rent', '￥600', '75%'],
      ['Food', '￥200', '25%'],
    ]);
  });
});
