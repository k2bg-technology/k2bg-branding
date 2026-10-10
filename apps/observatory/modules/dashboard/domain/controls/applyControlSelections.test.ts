import { describe, expect, it } from 'vitest';

import type { DashboardDefinition, Section } from '../definition';
import { applyControlSelections } from './applyControlSelections';

const section: Section = {
  id: 'headline',
  title: 'Headline',
  kind: 'stat-tiles',
  source: {
    dataset: 'metrics',
    view: 'monthly',
    time: 'recorded_on',
    filters: [{ column: 'enabled', operator: 'equals', value: true }],
  },
  controls: ['category'],
  tiles: [
    {
      label: 'Total',
      column: 'total',
      reduction: 'sum',
      format: { type: 'number' },
    },
  ],
};

const dashboard: DashboardDefinition = {
  id: 'summary',
  title: 'Summary',
  grain: 'month',
  timeZone: 'UTC',
  locale: 'en-US',
  revalidate: 86_400,
  defaultPeriod: 'latest-with-data',
  controls: [
    {
      id: 'category',
      label: 'Category',
      column: 'category',
      options: ['food'],
    },
  ],
  sections: [section],
};

describe('applyControlSelections', () => {
  it('appends a selected control after definition filters', () => {
    const result = applyControlSelections(dashboard, section, {
      category: 'food',
    });

    expect(result.filters).toEqual([
      { column: 'enabled', operator: 'equals', value: true },
      { column: 'category', operator: 'equals', value: 'food' },
    ]);
  });

  it('keeps the source when no control is selected', () => {
    const result = applyControlSelections(dashboard, section, {});

    expect(result).toEqual(section.source);
  });

  it('keeps a section without controls unchanged', () => {
    const result = applyControlSelections(
      dashboard,
      { ...section, controls: undefined },
      { category: 'food' }
    );

    expect(result).toEqual(section.source);
  });
});
