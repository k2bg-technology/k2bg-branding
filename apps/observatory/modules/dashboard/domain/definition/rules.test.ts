import { describe, expect, it } from 'vitest';

import { validateDefinitionRules } from './rules';
import type { DashboardDefinition } from './types';

function createDefinition(): DashboardDefinition {
  return {
    id: 'summary',
    title: 'Summary',
    grain: 'month',
    timeZone: 'UTC',
    locale: 'en-US',
    currency: 'USD',
    revalidate: 86_400,
    sections: [
      {
        id: 'headline',
        title: 'Headline',
        kind: 'stat-tiles',
        source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
        tiles: [
          {
            label: 'Total',
            column: 'total',
            reduction: 'sum',
            format: { type: 'currency' },
          },
        ],
      },
    ],
  };
}

describe('validateDefinitionRules', () => {
  it('reports the later path when section ids are duplicated', () => {
    const definition = createDefinition();
    definition.sections.push({ ...definition.sections[0] });

    const result = validateDefinitionRules(definition);

    expect(result).toContainEqual({
      path: ['sections', 1, 'id'],
      message: 'Duplicate section id "headline"',
    });
  });

  it('reports the tile path when currency formatting lacks a dashboard currency', () => {
    const definition = createDefinition();
    delete definition.currency;

    const result = validateDefinitionRules(definition);

    expect(result).toContainEqual({
      path: ['sections', 0, 'tiles', 0, 'format'],
      message: 'A currency tile requires dashboard currency',
    });
  });
});
