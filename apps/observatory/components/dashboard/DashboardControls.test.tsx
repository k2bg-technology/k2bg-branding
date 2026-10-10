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
const regionControl: ControlDefinition = {
  id: 'region',
  label: 'Region',
  column: 'region',
  options: 'distinct',
  order: { sortKey: { column: 'region', type: 'text' } },
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
  it('keeps resolved distinct options in their provided order', () => {
    render(
      <DashboardControls
        dashboard={{ ...dashboard, controls: [regionControl] }}
        state={emptyState}
        controlOptions={{
          region: { status: 'ready', options: ['west', 'east'] },
        }}
      />
    );

    expect(
      within(screen.getByRole('combobox', { name: 'Region' }))
        .getAllByRole('option')
        .map((option) => option.textContent)
    ).toEqual(['All', 'west', 'east']);
  });

  it('keeps the selected value and describes an unavailable control', () => {
    render(
      <DashboardControls
        dashboard={{ ...dashboard, controls: [regionControl] }}
        state={{ ...emptyState, controls: { region: 'east' } }}
        controlOptions={{ region: { status: 'unavailable' } }}
      />
    );

    const select = screen.getByRole('combobox', { name: 'Region' });
    expect(
      within(select)
        .getAllByRole('option')
        .map((option) => option.textContent)
    ).toEqual(['All', 'east']);
    expect(select).toHaveValue('east');
    expect(select).toHaveAccessibleDescription('Options could not be loaded');
    const form = select.closest('form');
    if (form === null) throw new Error('Expected controls form');
    expect(
      new URLSearchParams(
        Array.from(new FormData(form), ([key, value]) => [key, String(value)])
      ).toString()
    ).toBe('control.region=east');
  });

  it('shows only all when unavailable without a selection', () => {
    render(
      <DashboardControls
        dashboard={{ ...dashboard, controls: [regionControl] }}
        state={emptyState}
        controlOptions={{ region: { status: 'unavailable' } }}
      />
    );

    expect(
      within(screen.getByRole('combobox', { name: 'Region' })).getAllByRole(
        'option'
      )
    ).toHaveLength(1);
  });

  it('uses the dashboard unavailable label as the select description', () => {
    render(
      <DashboardControls
        dashboard={{
          ...dashboard,
          controls: [regionControl],
          labels: { controlOptionsUnavailable: '選択肢を読み込めません' },
        }}
        state={emptyState}
        controlOptions={{ region: { status: 'unavailable' } }}
      />
    );

    expect(
      screen.getByRole('combobox', { name: 'Region' })
    ).toHaveAccessibleDescription('選択肢を読み込めません');
  });

  it('labels the select and lists all before the fixed options', () => {
    render(
      <DashboardControls
        controlOptions={{}}
        dashboard={dashboard}
        state={emptyState}
      />
    );

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
        controlOptions={{}}
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
        controlOptions={{}}
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
    render(
      <DashboardControls
        controlOptions={{}}
        dashboard={dashboard}
        state={state}
      />
    );

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
        controlOptions={{}}
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
        controlOptions={{}}
        dashboard={{ ...dashboard, controls: undefined }}
        state={emptyState}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('replaces an unsubmitted choice when the URL state changes and changes back', () => {
    const { rerender } = render(
      <DashboardControls
        controlOptions={{}}
        dashboard={dashboard}
        state={{ ...emptyState, controls: { category: 'food' } }}
      />
    );
    fireEvent.change(screen.getByRole('combobox', { name: 'Category' }), {
      target: { value: 'drink' },
    });

    rerender(
      <DashboardControls
        controlOptions={{}}
        dashboard={dashboard}
        state={{ ...emptyState, controls: { category: 'drink' } }}
      />
    );
    rerender(
      <DashboardControls
        controlOptions={{}}
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
