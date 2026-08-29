import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChartColor, MatrixHeatmap } from '.';
import { type HeatmapLevel, heatmapCellColor } from './chartHeatmapScale';

const hourRows = ['00:00', '12:00'];
const weekdayColumns = ['Mon', 'Tue'];
const carbonDioxideValues = [
  [430, 480],
  [520, 610],
];

function heatmapCells(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>('[data-slot="matrix-heatmap-cell"]')
  );
}

function cellBackgrounds(container: HTMLElement): string[] {
  return heatmapCells(container).map((cell) => cell.style.backgroundColor);
}

function levelBackgrounds(levels: HeatmapLevel[]): string[] {
  return levels.map((level) => heatmapCellColor(level, ChartColor.CHART_1));
}

describe('MatrixHeatmap', () => {
  it('names the chart surface with the label', () => {
    const label = 'Carbon dioxide by hour of day and day of week';

    render(
      <MatrixHeatmap
        label={label}
        rows={hourRows}
        columns={weekdayColumns}
        values={carbonDioxideValues}
      />
    );

    expect(screen.getByRole('img', { name: label })).toBeInTheDocument();
  });

  it('renders one cell per row and column pair', () => {
    const { container } = render(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={hourRows}
        columns={weekdayColumns}
        values={carbonDioxideValues}
      />
    );

    expect(heatmapCells(container)).toHaveLength(
      hourRows.length * weekdayColumns.length
    );
  });

  it.each`
    labelKind   | label
    ${'row'}    | ${'00:00'}
    ${'row'}    | ${'12:00'}
    ${'column'} | ${'Mon'}
    ${'column'} | ${'Tue'}
  `('renders the $labelKind label $label', ({ label }) => {
    render(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={hourRows}
        columns={weekdayColumns}
        values={carbonDioxideValues}
      />
    );

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('renders a null value as an empty cell', () => {
    const missingColumn = 1;

    const { container } = render(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={['00:00']}
        columns={weekdayColumns}
        values={[[0, null]]}
      />
    );

    const missingCell = heatmapCells(container)[missingColumn];
    expect(missingCell.title).toBe('');
    expect(missingCell.style.backgroundColor).toBe('');
  });

  it('separates a measured zero from a null value', () => {
    const measuredColumn = 0;
    const missingColumn = 1;

    const { container } = render(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={['00:00']}
        columns={weekdayColumns}
        values={[[0, null]]}
      />
    );

    const cells = heatmapCells(container);
    expect(cells[measuredColumn].title).toBe('00:00 Mon: 0');
    expect(cells[missingColumn].title).toBe('');
  });

  it('renders an empty cell where a row stops short of the columns', () => {
    const missingColumn = 1;

    const { container } = render(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={['00:00']}
        columns={weekdayColumns}
        values={[[430]]}
      />
    );

    expect(heatmapCells(container)[missingColumn].title).toBe('');
  });

  it('builds the cell title from the row, the column and the formatted value', () => {
    const valueFormatter = (value: number) => `${value}ppm`;

    render(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={['00:00']}
        columns={['Mon']}
        values={[[480]]}
        valueFormatter={valueFormatter}
      />
    );

    expect(screen.getByTitle('00:00 Mon: 480ppm')).toBeInTheDocument();
  });

  it('scales the cells against the largest value when no max is given', () => {
    const { container } = render(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={hourRows}
        columns={weekdayColumns}
        values={[
          [1, 2],
          [3, 4],
        ]}
      />
    );

    expect(cellBackgrounds(container)).toEqual(levelBackgrounds([1, 2, 3, 4]));
  });

  it('scales the cells against the given min and max', () => {
    const { container } = render(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={['00:00']}
        columns={['Mon', 'Tue', 'Wed']}
        values={[[400, 1000, 1600]]}
        min={400}
        max={1600}
      />
    );

    expect(cellBackgrounds(container)).toEqual(levelBackgrounds([0, 2, 4]));
  });

  it('paints the cells with the given series color', () => {
    const { container } = render(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={['00:00']}
        columns={['Mon']}
        values={[[480]]}
        color={ChartColor.CHART_2}
      />
    );

    expect(cellBackgrounds(container)[0]).toContain('var(--color-chart-2)');
  });

  it('renders the scale legend when scale labels are given', () => {
    render(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={['00:00']}
        columns={['Mon']}
        values={[[480]]}
        scaleLabels={{ less: 'Lower', more: 'Higher' }}
      />
    );

    // Both ends of the scale are text nodes of one legend element.
    expect(screen.getByText(/Lower/)).toBeInTheDocument();
    expect(screen.getByText(/Higher/)).toBeInTheDocument();
  });

  it('renders no scale legend by default', () => {
    render(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={['00:00']}
        columns={['Mon']}
        values={[[480]]}
      />
    );

    expect(screen.queryByText(/Lower/)).not.toBeInTheDocument();
  });
});
