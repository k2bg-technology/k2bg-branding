import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type {
  ControlDefinition,
  DashboardDefinition,
  UrlState,
} from '../../modules/dashboard/domain';
import { Period } from '../../modules/dashboard/domain';
import { DashboardControls } from './DashboardControls';

const categoryControl: ControlDefinition = {
  id: 'category',
  label: 'Category',
  column: 'category',
  options: ['food', 'drink'],
};

const dashboard: DashboardDefinition = {
  id: 'summary',
  title: 'Summary',
  grain: 'month',
  timeZone: 'UTC',
  locale: 'en-US',
  revalidate: 86_400,
  defaultPeriod: 'latest-with-data',
  controls: [categoryControl],
  sections: [],
};

const emptyState: UrlState = {
  period: null,
  controls: {},
  pages: {},
  foreign: [],
};

describe('DashboardControls', () => {
  it('labels the select and lists all before the fixed options', () => {
    render(<DashboardControls dashboard={dashboard} state={emptyState} />);

    const select = screen.getByRole('combobox', { name: 'Category' });
    expect(
      within(select)
        .getAllByRole('option')
        .map((option) => option.textContent)
    ).toEqual(['All', 'food', 'drink']);
    expect(select).toHaveValue('');
  });

  it('uses the custom all label as the empty option', () => {
    render(
      <DashboardControls
        dashboard={{
          ...dashboard,
          controls: [{ ...categoryControl, allLabel: 'All categories' }],
        }}
        state={emptyState}
      />
    );

    const firstOption = within(
      screen.getByRole('combobox', { name: 'Category' })
    ).getAllByRole('option')[0];
    expect(firstOption).toHaveTextContent('All categories');
    expect(firstOption).toHaveValue('');
  });

  it('shows the selected option', () => {
    render(
      <DashboardControls
        dashboard={dashboard}
        state={{ ...emptyState, controls: { category: 'drink' } }}
      />
    );

    expect(screen.getByRole('combobox', { name: 'Category' })).toHaveValue(
      'drink'
    );
  });

  it.each([
    {
      name: 'a selected control, period, and foreign key',
      state: {
        period: Period.parse('month', '2026-08'),
        controls: { category: 'food' },
        pages: { detail: 2 },
        foreign: [{ key: 'note', value: 'kept' }],
      },
      query: 'period=2026-08&control.category=food&note=kept',
    },
    {
      name: 'all without an explicit period',
      state: emptyState,
      query: 'control.category=',
    },
  ])('submits $name without page parameters', ({ state, query }) => {
    render(<DashboardControls dashboard={dashboard} state={state} />);

    const form = screen.getByRole('button', { name: 'Apply' }).closest('form');
    if (form === null) {
      throw new Error('Expected controls form');
    }
    expect(form).toHaveAttribute('action', '/dashboards/summary');
    expect(
      new URLSearchParams(
        Array.from(new FormData(form), ([key, value]) => [key, String(value)])
      ).toString()
    ).toBe(query);
  });

  it('uses the dashboard apply label on a submit button', () => {
    render(
      <DashboardControls
        dashboard={{ ...dashboard, labels: { applyControls: '適用' } }}
        state={emptyState}
      />
    );

    expect(screen.getByRole('button', { name: '適用' })).toHaveAttribute(
      'type',
      'submit'
    );
  });

  it('renders nothing for a dashboard without controls', () => {
    const { container } = render(
      <DashboardControls
        dashboard={{ ...dashboard, controls: undefined }}
        state={emptyState}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('replaces an unsubmitted choice when the URL state changes and changes back', () => {
    const { rerender } = render(
      <DashboardControls
        dashboard={dashboard}
        state={{ ...emptyState, controls: { category: 'food' } }}
      />
    );
    fireEvent.change(screen.getByRole('combobox', { name: 'Category' }), {
      target: { value: 'drink' },
    });

    rerender(
      <DashboardControls
        dashboard={dashboard}
        state={{ ...emptyState, controls: { category: 'drink' } }}
      />
    );
    rerender(
      <DashboardControls
        dashboard={dashboard}
        state={{ ...emptyState, controls: { category: 'food' } }}
      />
    );

    expect(screen.getByRole('combobox', { name: 'Category' })).toHaveValue(
      'food'
    );
    const form = screen.getByRole('button', { name: 'Apply' }).closest('form');
    if (form === null) {
      throw new Error('Expected controls form');
    }
    expect(
      new URLSearchParams(
        Array.from(new FormData(form), ([key, value]) => [key, String(value)])
      ).toString()
    ).toBe('control.category=food');
  });
});
