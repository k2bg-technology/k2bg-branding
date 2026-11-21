import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type {
  DashboardDefinition,
  TableSection as TableSectionDefinition,
  UrlState,
} from '../../../modules/dashboard/domain';
import { TableSection } from './TableSection';

const section: TableSectionDefinition = {
  id: 'entries',
  title: 'Entries by category',
  kind: 'table',
  source: { dataset: 'metrics', view: 'entries', time: 'recorded_on' },
  columns: [
    {
      header: 'Category',
      type: 'text',
      column: 'category',
      link: { dashboard: 'category-detail', control: 'category' },
    },
  ],
  limit: 10,
};

const dashboard: DashboardDefinition = {
  id: 'summary',
  title: 'Summary',
  grain: 'month',
  locale: 'en-US',
  timeZone: 'UTC',
  revalidate: 86_400,
  defaultPeriod: 'last-complete',
  sections: [section],
};

const urlState: UrlState = {
  period: null,
  controls: { category: 'Current selection' },
  pages: {},
  foreign: [{ key: 'from', value: 'summary' }],
};

describe('TableSection column links', () => {
  it('links the displayed text to the target control with URL encoding', () => {
    const sut = (
      <TableSection
        dashboard={dashboard}
        section={section}
        data={{ rows: [['Arts & crafts']], page: null }}
        urlState={urlState}
      />
    );

    render(sut);

    expect(screen.getByRole('link', { name: 'Arts & crafts' })).toHaveAttribute(
      'href',
      '/dashboards/category-detail?control.category=Arts%20%26%20crafts'
    );
  });

  it.each([
    { name: 'a NULL value', value: null, text: '—' },
    { name: 'an empty string', value: '', text: '' },
  ])('renders $name as plain text', ({ value, text }) => {
    const sut = (
      <TableSection
        dashboard={dashboard}
        section={section}
        data={{ rows: [[value]], page: null }}
        urlState={urlState}
      />
    );

    render(sut);

    const cell = screen.getByRole('cell');
    expect(cell.textContent).toBe(text);
    expect(within(cell).queryByRole('link')).toBeNull();
  });
});
