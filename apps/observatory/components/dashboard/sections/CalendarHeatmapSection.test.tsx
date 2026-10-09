import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { dashboardDefinitionSchema } from '../../../modules/dashboard/adapters/output/definition-sources/file-system/schemas';
import { toSectionData } from '../../../modules/dashboard/adapters/output/query-services/warehouse/mapper';
import type {
  CalendarHeatmapSection as CalendarHeatmapSectionDefinition,
  DashboardDefinition,
} from '../../../modules/dashboard/domain';
import { Period, planSection } from '../../../modules/dashboard/domain';
import sampleDashboard from '../../../modules/dashboard/fixtures/sample-dashboard.json';
import { CalendarHeatmapSection } from './CalendarHeatmapSection';

function fixtureSection(index: number) {
  const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
  const section = dashboard.sections[index];
  if (section.kind !== 'calendar-heatmap') {
    throw new Error('Expected calendar heatmap fixture');
  }
  return { dashboard, section };
}

function selectedMonth(key: string) {
  const period = Period.parse('month', key);
  if (period === null) {
    throw new Error('Expected selected month');
  }
  return period;
}

async function mountCalendarSection(
  dashboard: DashboardDefinition,
  section: CalendarHeatmapSectionDefinition,
  month: string,
  rows: { period: string; value_0: number }[]
) {
  const period = selectedMonth(month);
  const data = toSectionData(
    rows,
    planSection(section, period, dashboard.timeZone)
  );
  if (data === null) {
    throw new Error('Expected mapped section data');
  }
  const result = render(
    <CalendarHeatmapSection
      dashboard={dashboard}
      section={section}
      data={data}
      period={period}
    />
  );
  await act(() => Promise.resolve());
  return result;
}

describe('CalendarHeatmapSection', () => {
  it('names the grid, formats a zero, and leaves a missing day with the dashboard label', async () => {
    const { dashboard, section } = fixtureSection(5);

    await mountCalendarSection(dashboard, section, '2026-08', [
      { period: '2026-08-03', value_0: 0 },
      { period: '2026-08-31', value_0: 1200 },
    ]);

    expect(
      screen.getByRole('img', { name: 'Daily spending' })
    ).toBeInTheDocument();
    expect(screen.getAllByTitle(/^\d{4}-\d{2}-\d{2}: /)).toHaveLength(91);
    expect(screen.getByTitle('2026-08-03: ￥0')).toBeInTheDocument();
    expect(screen.getByTitle('2026-08-31: ￥1,200')).toBeInTheDocument();
    expect(screen.getByTitle('2026-08-02: No entries')).toBeInTheDocument();
  });

  it('renders every day of the calendar year and none of the previous year', async () => {
    const { dashboard, section } = fixtureSection(6);

    await mountCalendarSection(dashboard, section, '2026-03', [
      { period: '2026-01-01', value_0: 3 },
      { period: '2026-12-31', value_0: 12 },
    ]);

    expect(screen.getAllByTitle(/^\d{4}-\d{2}-\d{2}: /)).toHaveLength(365);
    expect(screen.getByTitle('2026-01-01: 3 °C')).toBeInTheDocument();
    expect(screen.getByTitle('2026-12-31: 12 °C')).toBeInTheDocument();
    expect(screen.queryByTitle(/^2025-12-31: /)).not.toBeInTheDocument();
  });

  it('includes the leap day', async () => {
    const { dashboard, section } = fixtureSection(6);

    await mountCalendarSection(dashboard, section, '2028-02', [
      { period: '2028-02-29', value_0: 1 },
    ]);

    expect(screen.getAllByTitle(/^\d{4}-\d{2}-\d{2}: /)).toHaveLength(366);
    expect(screen.getByTitle('2028-02-29: 1 °C')).toBeInTheDocument();
  });

  it('keeps a calendar day on its own cell under a western time zone', async () => {
    const section: CalendarHeatmapSectionDefinition = {
      id: 'daily-values',
      title: 'Daily values',
      kind: 'calendar-heatmap',
      source: {
        dataset: 'metrics',
        view: 'entries',
        time: { column: 'recorded_at', type: 'timestamp' },
      },
      range: 'trailing',
      window: 31,
      value: { column: 'value', reduction: 'sum' },
      format: { type: 'number' },
    };
    const dashboard: DashboardDefinition = {
      id: 'values',
      title: 'Values',
      grain: 'month',
      timeZone: 'America/Los_Angeles',
      locale: 'en-US',
      revalidate: 86_400,
      defaultPeriod: 'latest-with-data',
      sections: [section],
    };

    await mountCalendarSection(dashboard, section, '2026-03', [
      { period: '2026-03-01', value_0: 7 },
    ]);

    expect(screen.getByTitle('2026-03-01: 7')).toBeInTheDocument();
    expect(screen.getByTitle('2026-03-02: No data')).toBeInTheDocument();
    expect(screen.getAllByTitle(/^\d{4}-\d{2}-\d{2}: /)).toHaveLength(31);
  });
});
