import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CalendarHeatmap, type CalendarHeatmapDay, ChartColor } from '.';
import { heatmapCellColor } from './chartHeatmapScale';

const daysPerWeek = 7;
const mondayRow = 0;
const tuesdayRow = 1;
const wednesdayRow = 2;

/** 2026-02-23 is a Monday, so a grid built from that week starts exactly there. */
const mondayDate = '2026-02-23';
const tuesdayDate = '2026-02-24';
const wednesdayDate = '2026-02-25';
/** The Tuesday of the following week, so the grid has to span two weeks. */
const nextTuesdayDate = '2026-03-03';

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function createDay(
  overrides: Partial<CalendarHeatmapDay> = {}
): CalendarHeatmapDay {
  return { date: wednesdayDate, value: 5, ...overrides };
}

function heatmapCells(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      '[data-slot="calendar-heatmap-cell"]'
    )
  );
}

describe('CalendarHeatmap', () => {
  it('names the chart surface with the label', () => {
    const label = 'Daily step count over the last 26 weeks';

    render(<CalendarHeatmap label={label} days={[createDay()]} />);

    expect(screen.getByRole('img', { name: label })).toBeInTheDocument();
  });

  it('starts the grid on the Monday of the first day week', () => {
    const { container } = render(
      <CalendarHeatmap label="Steps" days={[createDay()]} />
    );

    const cells = heatmapCells(container);
    expect(cells).toHaveLength(daysPerWeek);
    expect(cells.findIndex((cell) => cell.title !== '')).toBe(wednesdayRow);
  });

  it('pads the grid out to whole weeks', () => {
    const days = [
      createDay({ date: wednesdayDate }),
      createDay({ date: nextTuesdayDate, value: 8 }),
    ];
    const expectedWeeks = 2;

    const { container } = render(<CalendarHeatmap label="Steps" days={days} />);

    expect(heatmapCells(container)).toHaveLength(expectedWeeks * daysPerWeek);
  });

  it('leaves a date missing from days without a measurement', () => {
    const days = [createDay({ date: mondayDate, value: 0 })];

    const { container } = render(<CalendarHeatmap label="Steps" days={days} />);

    const missingCell = heatmapCells(container)[tuesdayRow];
    expect(missingCell.title).toBe('');
    expect(missingCell.style.backgroundColor).toBe('');
  });

  it('separates a measured zero from a date missing from days', () => {
    const days = [createDay({ date: mondayDate, value: 0 })];

    const { container } = render(<CalendarHeatmap label="Steps" days={days} />);

    const cells = heatmapCells(container);
    expect(cells[mondayRow].title).toBe(`${mondayDate}: 0`);
    expect(cells[tuesdayRow].title).toBe('');
  });

  it('builds the cell title from the date and the formatted value', () => {
    const days = [createDay({ date: mondayDate, value: 12000 })];
    const valueFormatter = (value: number) =>
      `${value.toLocaleString('en-US')} steps`;

    render(
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

  it('scales the cells against the largest value when no max is given', () => {
    const days = [
      createDay({ date: mondayDate, value: 5 }),
      createDay({ date: tuesdayDate, value: 20 }),
    ];

    const { container } = render(<CalendarHeatmap label="Steps" days={days} />);

    const cells = heatmapCells(container);
    expect(cells[mondayRow].style.backgroundColor).toBe(
      heatmapCellColor(1, ChartColor.CHART_1)
    );
    expect(cells[tuesdayRow].style.backgroundColor).toBe(
      heatmapCellColor(4, ChartColor.CHART_1)
    );
  });

  it('scales the cells against the given max', () => {
    const days = [
      createDay({ date: mondayDate, value: 5 }),
      createDay({ date: tuesdayDate, value: 20 }),
    ];
    const max = 40;

    const { container } = render(
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

  it('paints the cells with the given series color', () => {
    const days = [createDay({ date: mondayDate })];

    const { container } = render(
      <CalendarHeatmap label="Steps" days={days} color={ChartColor.CHART_2} />
    );

    expect(heatmapCells(container)[mondayRow].style.backgroundColor).toContain(
      'var(--color-chart-2)'
    );
  });

  it('labels only the weekday rows that clear the row height', () => {
    render(
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

  it('renders no weekday labels by default', () => {
    render(<CalendarHeatmap label="Steps" days={[createDay()]} />);

    expect(screen.queryByText('Mon')).not.toBeInTheDocument();
  });

  it('renders the scale legend when scale labels are given', () => {
    render(
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

  it('renders no scale legend by default', () => {
    render(<CalendarHeatmap label="Steps" days={[createDay()]} />);

    expect(screen.queryByText(/Less/)).not.toBeInTheDocument();
  });

  it('renders no cells when there are no days', () => {
    const { container } = render(<CalendarHeatmap label="Steps" days={[]} />);

    expect(heatmapCells(container)).toHaveLength(0);
  });
});
