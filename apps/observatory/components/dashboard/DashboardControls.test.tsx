import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

async function openOptions(name: string): Promise<(string | null)[]> {
  await userEvent.click(screen.getByRole('combobox', { name }));
  const options = await screen.findAllByRole('option');
  return options.map((option) => option.textContent);
}

function submittedQuery(): string {
  const form = screen.getByRole('button', { name: 'Apply' }).closest('form');
  if (form === null) {
    throw new Error('Expected controls form');
  }
  return new URLSearchParams(
    Array.from(new FormData(form), ([key, value]) => [key, String(value)])
  ).toString();
}

describe('DashboardControls', () => {
  it('keeps resolved distinct options in their provided order', async () => {
    render(
      <DashboardControls
        dashboard={{ ...dashboard, controls: [regionControl] }}
        state={emptyState}
        controlOptions={{
          region: { status: 'ready', options: ['west', 'east'] },
        }}
      />
    );

    expect(await openOptions('Region')).toEqual(['All', 'west', 'east']);
  });

  it('keeps the selected value and describes an unavailable control', async () => {
    render(
      <DashboardControls
        dashboard={{ ...dashboard, controls: [regionControl] }}
        state={{ ...emptyState, controls: { region: 'east' } }}
        controlOptions={{ region: { status: 'unavailable' } }}
      />
    );

    const select = screen.getByRole('combobox', { name: 'Region' });
    expect(select).toHaveTextContent('east');
    expect(select).toHaveAccessibleDescription('Options could not be loaded');
    expect(submittedQuery()).toBe('control.region=east');
    expect(await openOptions('Region')).toEqual(['All', 'east']);
  });

  it('shows only all when unavailable without a selection', async () => {
    render(
      <DashboardControls
        dashboard={{ ...dashboard, controls: [regionControl] }}
        state={emptyState}
        controlOptions={{ region: { status: 'unavailable' } }}
      />
    );

    expect(await openOptions('Region')).toEqual(['All']);
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

  it('labels the select and lists all before the fixed options', async () => {
    render(
      <DashboardControls
        controlOptions={{}}
        dashboard={dashboard}
        state={emptyState}
      />
    );

    expect(
      screen.getByRole('combobox', { name: 'Category' })
    ).toHaveTextContent('All');
    expect(await openOptions('Category')).toEqual(['All', 'food', 'drink']);
  });

  it('uses the custom all label as the empty option', async () => {
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

    expect(
      screen.getByRole('combobox', { name: 'Category' })
    ).toHaveTextContent('All categories');
    expect(submittedQuery()).toBe('control.category=');
    expect((await openOptions('Category'))[0]).toBe('All categories');
  });

  it('shows the selected option', () => {
    render(
      <DashboardControls
        controlOptions={{}}
        dashboard={dashboard}
        state={{ ...emptyState, controls: { category: 'drink' } }}
      />
    );

    expect(
      screen.getByRole('combobox', { name: 'Category' })
    ).toHaveTextContent('drink');
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

    expect(
      screen.getByRole('button', { name: 'Apply' }).closest('form')
    ).toHaveAttribute('action', '/dashboards/summary');
    expect(submittedQuery()).toBe(query);
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

  it('replaces an unsubmitted choice when the URL state changes and changes back', async () => {
    const { rerender } = render(
      <DashboardControls
        controlOptions={{}}
        dashboard={dashboard}
        state={{ ...emptyState, controls: { category: 'food' } }}
      />
    );
    await openOptions('Category');
    await userEvent.click(screen.getByRole('option', { name: 'drink' }));

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

    expect(
      screen.getByRole('combobox', { name: 'Category' })
    ).toHaveTextContent('food');
    expect(submittedQuery()).toBe('control.category=food');
  });
});
