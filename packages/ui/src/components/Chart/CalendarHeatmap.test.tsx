import { act, type RenderResult, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { CalendarHeatmap, type CalendarHeatmapDay, ChartColor } from '.';
import { heatmapCellColor } from './chartHeatmapScale';

const dayMs = 86_400_000;
const daysPerWeek = 7;
const mondayRow = 0;
const tuesdayRow = 1;
const wednesdayRow = 2;
const lowestLevel = 0;

/** 2026-02-23 is a Monday, so a grid built from that week starts exactly there. */
const mondayDate = '2026-02-23';
const tuesdayDate = '2026-02-24';
const wednesdayDate = '2026-02-25';
/** The Tuesday of the following week, so the grid has to span two weeks. */
const nextTuesdayDate = '2026-03-03';

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const defaultEmptyLabel = 'No data';

/** The scroll area measures itself in a microtask, after the mount effects. */
async function renderHeatmap(ui: ReactElement): Promise<RenderResult> {
  const result = render(ui);
  await act(() => Promise.resolve());
  return result;
}

function createDay(
  overrides: Partial<CalendarHeatmapDay> = {}
): CalendarHeatmapDay {
  return { date: wednesdayDate, value: 5, ...overrides };
}

/** Monday and Wednesday measured, so the Tuesday between them is a real gap. */
function createWeekWithGap(): CalendarHeatmapDay[] {
  return [
    createDay({ date: mondayDate, value: 0 }),
    createDay({ date: wednesdayDate, value: 5 }),
  ];
}

/** A whole Monday-to-Sunday week, so the grid needs no padding. */
function createFullWeek(): CalendarHeatmapDay[] {
  const startTime = Date.UTC(2026, 1, 23);
  return Array.from({ length: daysPerWeek }, (_, index) => ({
    date: new Date(startTime + index * dayMs).toISOString().slice(0, 10),
    value: index + 1,
  }));
}

function heatmapCells(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      '[data-slot="calendar-heatmap-cell"]'
    )
  );
}

function heatmapGrid(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>(
    '[data-slot="calendar-heatmap-grid"]'
  );
}

function measuredCellIndex(container: HTMLElement): number {
  return heatmapCells(container).findIndex(
    (cell) =>
      !cell.hasAttribute('data-empty') && !cell.hasAttribute('data-padding')
  );
}

describe('CalendarHeatmap', () => {
  it('names the chart surface with the label', async () => {
    const label = 'Daily step count over the last 26 weeks';

    await renderHeatmap(<CalendarHeatmap label={label} days={[createDay()]} />);

    expect(screen.getByRole('img', { name: label })).toBeInTheDocument();
  });

  it('starts the grid on the Monday of the first day week', async () => {
    const { container } = await renderHeatmap(
      <CalendarHeatmap label="Steps" days={[createDay()]} />
    );

    expect(heatmapCells(container)).toHaveLength(daysPerWeek);
    expect(measuredCellIndex(container)).toBe(wednesdayRow);
  });

  it.each`
    weekStart              | props                  | expectedRow
    ${'nothing given'}     | ${{}}                  | ${2}
    ${'the en-US locale'}  | ${{ locale: 'en-US' }} | ${3}
    ${'an explicit start'} | ${{ weekStartsOn: 3 }} | ${0}
  `(
    'places a Wednesday on row $expectedRow with $weekStart',
    async ({ props, expectedRow }) => {
      const { container } = await renderHeatmap(
        <CalendarHeatmap label="Steps" days={[createDay()]} {...props} />
      );

      expect(measuredCellIndex(container)).toBe(expectedRow);
    }
  );

  it('pads the grid out to whole weeks', async () => {
    const days = [
      createDay({ date: wednesdayDate }),
      createDay({ date: nextTuesdayDate, value: 8 }),
    ];
    const expectedWeeks = 2;

    const { container } = await renderHeatmap(
      <CalendarHeatmap label="Steps" days={days} />
    );

    expect(heatmapCells(container)).toHaveLength(expectedWeeks * daysPerWeek);
  });

  it('leaves a date missing from days without a measurement', async () => {
    const days = createWeekWithGap();

    const { container } = await renderHeatmap(
      <CalendarHeatmap label="Steps" days={days} />
    );

    const missingCell = heatmapCells(container)[tuesdayRow];
    expect(missingCell.title).toBe(`${tuesdayDate}: ${defaultEmptyLabel}`);
    expect(missingCell.style.backgroundColor).toBe('');
  });

  it('marks a missing date with a hatch rather than a color alone', async () => {
    const days = createWeekWithGap();

    const { container } = await renderHeatmap(
      <CalendarHeatmap label="Steps" days={days} />
    );

    expect(heatmapCells(container)[tuesdayRow].style.backgroundImage).toContain(
      'repeating-linear-gradient'
    );
  });

  it('names a missing date with the given empty label', async () => {
    const days = createWeekWithGap();
    const emptyLabel = 'Not measured';

    const { container } = await renderHeatmap(
      <CalendarHeatmap label="Steps" days={days} emptyLabel={emptyLabel} />
    );

    expect(heatmapCells(container)[tuesdayRow].title).toBe(
      `${tuesdayDate}: ${emptyLabel}`
    );
  });

  it('shows nothing for a day that only pads the week out', async () => {
    const days = createWeekWithGap();
    const thursdayRow = 3;

    const { container } = await renderHeatmap(
      <CalendarHeatmap label="Steps" days={days} />
    );

    // The range ends on the Wednesday, so the Thursday is layout, not a gap.
    const paddingCell = heatmapCells(container)[thursdayRow];
    expect(paddingCell).toHaveAttribute('data-padding');
    expect(paddingCell.title).toBe('');
    expect(paddingCell.style.backgroundImage).toBe('');
    expect(paddingCell.style.backgroundColor).toBe('');
  });

  it('fills a measured zero at the lowest step of the scale', async () => {
    const days = [createDay({ date: mondayDate, value: 0 })];

    const { container } = await renderHeatmap(
      <CalendarHeatmap label="Steps" days={days} />
    );

    const zeroCell = heatmapCells(container)[mondayRow];
    expect(zeroCell.title).toBe(`${mondayDate}: 0`);
    expect(zeroCell.style.backgroundColor).toBe(
      heatmapCellColor(lowestLevel, ChartColor.CHART_1)
    );
  });

  it('builds the cell title from the date and the formatted value', async () => {
    const days = [createDay({ date: mondayDate, value: 12000 })];
    const valueFormatter = (value: number) =>
      `${value.toLocaleString('en-US')} steps`;

    await renderHeatmap(
      <CalendarHeatmap
        label="Steps"
        days={days}
        valueFormatter={valueFormatter}
      />
    );

    expect(
      screen.getByTitle(`${mondayDate}: 12,000 steps`)
    ).toBeInTheDocument();
  });

  it('scales the cells against the largest value when no max is given', async () => {
    const days = [
      createDay({ date: mondayDate, value: 5 }),
      createDay({ date: tuesdayDate, value: 20 }),
    ];

    const { container } = await renderHeatmap(
      <CalendarHeatmap label="Steps" days={days} />
    );

    const cells = heatmapCells(container);
    expect(cells[mondayRow].style.backgroundColor).toBe(
      heatmapCellColor(1, ChartColor.CHART_1)
    );
    expect(cells[tuesdayRow].style.backgroundColor).toBe(
      heatmapCellColor(4, ChartColor.CHART_1)
    );
  });

  it('scales the cells against the given max', async () => {
    const days = [
      createDay({ date: mondayDate, value: 5 }),
      createDay({ date: tuesdayDate, value: 20 }),
    ];
    const max = 40;

    const { container } = await renderHeatmap(
      <CalendarHeatmap label="Steps" days={days} max={max} />
    );

    const cells = heatmapCells(container);
    expect(cells[mondayRow].style.backgroundColor).toBe(
      heatmapCellColor(1, ChartColor.CHART_1)
    );
    expect(cells[tuesdayRow].style.backgroundColor).toBe(
      heatmapCellColor(2, ChartColor.CHART_1)
    );
  });

  it('paints the cells with the given series color', async () => {
    const days = [createDay({ date: mondayDate })];

    const { container } = await renderHeatmap(
      <CalendarHeatmap label="Steps" days={days} color={ChartColor.CHART_2} />
    );

    expect(heatmapCells(container)[mondayRow].style.backgroundColor).toContain(
      'var(--color-chart-2)'
    );
  });

  it('labels only the weekday rows that clear the row height', async () => {
    await renderHeatmap(
      <CalendarHeatmap
        label="Steps"
        days={[createDay()]}
        weekdayLabels={weekdayLabels}
      />
    );

    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.queryByText('Tue')).not.toBeInTheDocument();
  });

  it('renders no weekday labels by default', async () => {
    await renderHeatmap(<CalendarHeatmap label="Steps" days={[createDay()]} />);

    expect(screen.queryByText('Mon')).not.toBeInTheDocument();
  });

  it('names the weekdays from the locale when no labels are given', async () => {
    await renderHeatmap(
      <CalendarHeatmap label="Steps" days={[createDay()]} locale="en-US" />
    );

    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
  });

  it('keeps the given weekday labels over the locale names', async () => {
    await renderHeatmap(
      <CalendarHeatmap
        label="Steps"
        days={[createDay()]}
        locale="en-US"
        weekdayLabels={weekdayLabels}
      />
    );

    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.queryByText('Sun')).not.toBeInTheDocument();
  });

  it('leaves spare width beside the grid rather than widening the weekday labels', async () => {
    const { container } = await renderHeatmap(
      <CalendarHeatmap
        label="Steps"
        days={[createDay()]}
        weekdayLabels={weekdayLabels}
      />
    );

    expect(heatmapGrid(container)?.className).toContain('justify-start');
  });

  it('puts the grid inside the design system scroll area', async () => {
    const label = 'Steps';

    await renderHeatmap(<CalendarHeatmap label={label} days={[createDay()]} />);

    // The scroll area owns the scrolling port and its keyboard reachability.
    expect(
      screen
        .getByRole('img', { name: label })
        .closest('[data-slot="calendar-heatmap-scroll"]')
    ).toBeInTheDocument();
  });

  it('keeps the weekday labels outside the scroll port, with nothing masking them', async () => {
    await renderHeatmap(
      <CalendarHeatmap
        label="Steps"
        days={[createDay()]}
        weekdayLabels={weekdayLabels}
      />
    );

    // Scrolled cells are clipped by the port instead of passing under a label,
    // so the label needs no background fill of its own.
    const weekdayLabel = screen.getByText('Mon');
    expect(
      weekdayLabel.closest('[data-slot="calendar-heatmap-scroll"]')
    ).toBeNull();
    expect(weekdayLabel.className).not.toContain('bg-');
  });

  it('labels the week column a month starts in', async () => {
    const days = [
      createDay({ date: wednesdayDate }),
      createDay({ date: nextTuesdayDate, value: 8 }),
    ];
    const marchLabel = '3';

    await renderHeatmap(<CalendarHeatmap label="Steps" days={days} />);

    expect(screen.getByText(marchLabel)).toBeInTheDocument();
  });

  it('names the months in the given locale', async () => {
    const days = [
      createDay({ date: wednesdayDate }),
      createDay({ date: nextTuesdayDate, value: 8 }),
    ];

    await renderHeatmap(
      <CalendarHeatmap label="Steps" days={days} locale="en-US" />
    );

    expect(screen.getByText('Mar')).toBeInTheDocument();
  });

  it('renders no month labels when they are turned off', async () => {
    const days = [
      createDay({ date: wednesdayDate }),
      createDay({ date: nextTuesdayDate, value: 8 }),
    ];
    const marchLabel = '3';

    await renderHeatmap(
      <CalendarHeatmap label="Steps" days={days} showMonthLabels={false} />
    );

    expect(screen.queryByText(marchLabel)).not.toBeInTheDocument();
  });

  it('describes the image with how many days have no data', async () => {
    const label = 'Steps';
    // The Tuesday is absent from days and the Wednesday is explicitly empty.
    const days = [
      createDay({ date: mondayDate, value: 0 }),
      createDay({ date: wednesdayDate, value: null }),
    ];
    const missingCount = 2;

    await renderHeatmap(<CalendarHeatmap label={label} days={days} />);

    expect(
      screen.getByRole('img', { name: label })
    ).toHaveAccessibleDescription(`${defaultEmptyLabel}: ${missingCount}`);
  });

  it('leaves the weeks padding the grid out of the description', async () => {
    const label = 'Steps';

    // One Wednesday pads out to seven cells, six of which are layout only.
    await renderHeatmap(
      <CalendarHeatmap label={label} days={[createDay({ value: 5 })]} />
    );

    expect(
      screen.getByRole('img', { name: label })
    ).toHaveAccessibleDescription('');
  });

  it('builds the description from the given empty label', async () => {
    const label = 'Steps';
    const emptyLabel = 'データなし';

    await renderHeatmap(
      <CalendarHeatmap
        label={label}
        days={[createDay({ value: null })]}
        emptyLabel={emptyLabel}
      />
    );

    expect(
      screen.getByRole('img', { name: label })
    ).toHaveAccessibleDescription(`${emptyLabel}: 1`);
  });

  it('keeps the description out of sight', async () => {
    const label = 'Steps';

    await renderHeatmap(
      <CalendarHeatmap label={label} days={[createDay({ value: null })]} />
    );

    const describedBy = screen
      .getByRole('img', { name: label })
      .getAttribute('aria-describedby');
    expect(document.getElementById(describedBy ?? '')).toHaveClass('sr-only');
  });

  it('clamps the cell size between the given bounds', async () => {
    const minimumCellSize = 10;
    const maximumCellSize = 24;

    const { container } = await renderHeatmap(
      <CalendarHeatmap
        label="Steps"
        days={[createDay()]}
        minimumCellSize={minimumCellSize}
        maximumCellSize={maximumCellSize}
      />
    );

    expect(heatmapGrid(container)?.style.gridAutoColumns).toBe(
      `minmax(${minimumCellSize}px, ${maximumCellSize}px)`
    );
  });

  it('renders the scale legend when scale labels are given', async () => {
    await renderHeatmap(
      <CalendarHeatmap
        label="Steps"
        days={[createDay()]}
        scaleLabels={{ less: 'Less', more: 'More' }}
      />
    );

    // Both ends of the scale are text nodes of one legend element.
    expect(screen.getByText(/Less/)).toBeInTheDocument();
    expect(screen.getByText(/More/)).toBeInTheDocument();
  });

  it('adds the no-data key to the legend when a day has no measurement', async () => {
    const { container } = await renderHeatmap(
      <CalendarHeatmap
        label="Steps"
        days={createWeekWithGap()}
        scaleLabels={{ less: 'Less', more: 'More' }}
      />
    );

    expect(
      container.querySelector('[data-slot="heatmap-scale-legend"]')
    ).toHaveTextContent(defaultEmptyLabel);
  });

  it('leaves the no-data key out when only padding days are empty', async () => {
    const { container } = await renderHeatmap(
      <CalendarHeatmap
        label="Steps"
        days={[createDay({ value: 5 })]}
        scaleLabels={{ less: 'Less', more: 'More' }}
      />
    );

    expect(
      container.querySelector('[data-slot="heatmap-scale-legend"]')
    ).not.toHaveTextContent(defaultEmptyLabel);
  });

  it('leaves the no-data key out when every day is measured', async () => {
    await renderHeatmap(
      <CalendarHeatmap
        label="Steps"
        days={createFullWeek()}
        scaleLabels={{ less: 'Less', more: 'More' }}
      />
    );

    expect(
      screen.queryByText(new RegExp(defaultEmptyLabel))
    ).not.toBeInTheDocument();
  });

  it('renders no scale legend by default', async () => {
    await renderHeatmap(<CalendarHeatmap label="Steps" days={[createDay()]} />);

    expect(screen.queryByText(/Less/)).not.toBeInTheDocument();
  });

  it('renders no cells when there are no days', async () => {
    const { container } = await renderHeatmap(
      <CalendarHeatmap label="Steps" days={[]} />
    );

    expect(heatmapCells(container)).toHaveLength(0);
  });
});
