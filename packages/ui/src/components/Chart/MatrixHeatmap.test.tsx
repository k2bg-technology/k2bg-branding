import { act, type RenderResult, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { ChartColor, MatrixHeatmap } from '.';
import { type HeatmapLevel, heatmapCellColor } from './chartHeatmapScale';

const hourRows = ['00:00', '12:00'];
const weekdayColumns = ['Mon', 'Tue'];
const carbonDioxideValues = [
  [430, 480],
  [520, 610],
];
const lowestLevel = 0;
const defaultEmptyLabel = 'No data';
const defaultMinimumCellSize = 12;
const defaultMaximumCellSize = 64;

/** The scroll area measures itself in a microtask, after the mount effects. */
async function renderHeatmap(ui: ReactElement): Promise<RenderResult> {
  const result = render(ui);
  await act(() => Promise.resolve());
  return result;
}

function heatmapCells(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>('[data-slot="matrix-heatmap-cell"]')
  );
}

function heatmapGrid(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>(
    '[data-slot="matrix-heatmap-grid"]'
  );
}

function cellBackgrounds(container: HTMLElement): string[] {
  return heatmapCells(container).map((cell) => cell.style.backgroundColor);
}

function levelBackgrounds(levels: HeatmapLevel[]): string[] {
  return levels.map((level) => heatmapCellColor(level, ChartColor.CHART_1));
}

describe('MatrixHeatmap', () => {
  it('names the chart surface with the label', async () => {
    const label = 'Carbon dioxide by hour of day and day of week';

    await renderHeatmap(
      <MatrixHeatmap
        label={label}
        rows={hourRows}
        columns={weekdayColumns}
        values={carbonDioxideValues}
      />
    );

    expect(screen.getByRole('img', { name: label })).toBeInTheDocument();
  });

  it('renders one cell per row and column pair', async () => {
    const { container } = await renderHeatmap(
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
  `('renders the $labelKind label $label', async ({ label }) => {
    await renderHeatmap(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={hourRows}
        columns={weekdayColumns}
        values={carbonDioxideValues}
      />
    );

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('renders a null value as an empty cell', async () => {
    const missingColumn = 1;

    const { container } = await renderHeatmap(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={['00:00']}
        columns={weekdayColumns}
        values={[[0, null]]}
      />
    );

    const missingCell = heatmapCells(container)[missingColumn];
    expect(missingCell.title).toBe(`00:00 Tue: ${defaultEmptyLabel}`);
    expect(missingCell.style.backgroundColor).toBe('');
  });

  it('marks a null value with a hatch rather than a color alone', async () => {
    const missingColumn = 1;

    const { container } = await renderHeatmap(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={['00:00']}
        columns={weekdayColumns}
        values={[[0, null]]}
      />
    );

    expect(
      heatmapCells(container)[missingColumn].style.backgroundImage
    ).toContain('repeating-linear-gradient');
  });

  it('names a null value with the given empty label', async () => {
    const missingColumn = 1;
    const emptyLabel = 'Sensor offline';

    const { container } = await renderHeatmap(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={['00:00']}
        columns={weekdayColumns}
        values={[[0, null]]}
        emptyLabel={emptyLabel}
      />
    );

    expect(heatmapCells(container)[missingColumn].title).toBe(
      `00:00 Tue: ${emptyLabel}`
    );
  });

  it('separates a measured zero from a null value', async () => {
    const measuredColumn = 0;
    const missingColumn = 1;

    const { container } = await renderHeatmap(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={['00:00']}
        columns={weekdayColumns}
        values={[[0, null]]}
      />
    );

    const cells = heatmapCells(container);
    expect(cells[measuredColumn].title).toBe('00:00 Mon: 0');
    expect(cells[missingColumn].title).toBe(`00:00 Tue: ${defaultEmptyLabel}`);
  });

  it('fills a measured zero at the lowest step of the scale', async () => {
    const measuredColumn = 0;

    const { container } = await renderHeatmap(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={['00:00']}
        columns={weekdayColumns}
        values={[[0, null]]}
      />
    );

    expect(cellBackgrounds(container)[measuredColumn]).toBe(
      heatmapCellColor(lowestLevel, ChartColor.CHART_1)
    );
  });

  it('renders an empty cell where a row stops short of the columns', async () => {
    const missingColumn = 1;

    const { container } = await renderHeatmap(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={['00:00']}
        columns={weekdayColumns}
        values={[[430]]}
      />
    );

    expect(heatmapCells(container)[missingColumn].title).toBe(
      `00:00 Tue: ${defaultEmptyLabel}`
    );
  });

  it('builds the cell title from the row, the column and the formatted value', async () => {
    const valueFormatter = (value: number) => `${value}ppm`;

    await renderHeatmap(
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

  it('scales the cells against the largest value when no max is given', async () => {
    const { container } = await renderHeatmap(
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

  it('scales the cells against the given min and max', async () => {
    const { container } = await renderHeatmap(
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

  it('paints the cells with the given series color', async () => {
    const { container } = await renderHeatmap(
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

  it('clamps the cell size between the given bounds', async () => {
    const minimumCellSize = 20;
    const maximumCellSize = 40;

    const { container } = await renderHeatmap(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={['00:00']}
        columns={weekdayColumns}
        values={carbonDioxideValues}
        minimumCellSize={minimumCellSize}
        maximumCellSize={maximumCellSize}
      />
    );

    expect(heatmapGrid(container)?.style.gridTemplateColumns).toBe(
      `repeat(${weekdayColumns.length}, minmax(${minimumCellSize}px, ${maximumCellSize}px))`
    );
  });

  it('sizes the cells between 12 and 64 pixels by default', async () => {
    const { container } = await renderHeatmap(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={['00:00']}
        columns={weekdayColumns}
        values={carbonDioxideValues}
      />
    );

    expect(heatmapGrid(container)?.style.gridTemplateColumns).toContain(
      `minmax(${defaultMinimumCellSize}px, ${defaultMaximumCellSize}px)`
    );
  });

  it('leaves spare width beside the grid rather than widening the row labels', async () => {
    const { container } = await renderHeatmap(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={hourRows}
        columns={weekdayColumns}
        values={carbonDioxideValues}
      />
    );

    expect(heatmapGrid(container)?.className).toContain('justify-start');
  });

  it('puts the grid inside the design system scroll area', async () => {
    const label = 'Carbon dioxide';

    await renderHeatmap(
      <MatrixHeatmap
        label={label}
        rows={hourRows}
        columns={weekdayColumns}
        values={carbonDioxideValues}
      />
    );

    // The scroll area owns the scrolling port and its keyboard reachability.
    expect(
      screen
        .getByRole('img', { name: label })
        .closest('[data-slot="matrix-heatmap-scroll"]')
    ).toBeInTheDocument();
  });

  it('keeps the row labels outside the scroll port, with nothing masking them', async () => {
    await renderHeatmap(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={hourRows}
        columns={weekdayColumns}
        values={carbonDioxideValues}
      />
    );

    // Scrolled cells are clipped by the port instead of passing under a label,
    // so the label needs no background fill of its own.
    const rowLabel = screen.getByText('00:00');
    expect(rowLabel.closest('[data-slot="matrix-heatmap-scroll"]')).toBeNull();
    expect(rowLabel.className).not.toContain('bg-');
  });

  it('describes the image with how many cells have no data', async () => {
    const label = 'Carbon dioxide';
    const missingCount = 2;

    await renderHeatmap(
      <MatrixHeatmap
        label={label}
        rows={['00:00']}
        columns={['Mon', 'Tue', 'Wed']}
        values={[[480, null, null]]}
      />
    );

    expect(
      screen.getByRole('img', { name: label })
    ).toHaveAccessibleDescription(`${defaultEmptyLabel}: ${missingCount}`);
  });

  it('builds the description from the given empty label', async () => {
    const label = 'Carbon dioxide';
    const emptyLabel = 'データなし';

    await renderHeatmap(
      <MatrixHeatmap
        label={label}
        rows={['00:00']}
        columns={['Mon']}
        values={[[null]]}
        emptyLabel={emptyLabel}
      />
    );

    expect(
      screen.getByRole('img', { name: label })
    ).toHaveAccessibleDescription(`${emptyLabel}: 1`);
  });

  it('leaves a measured zero undescribed', async () => {
    const label = 'Carbon dioxide';

    await renderHeatmap(
      <MatrixHeatmap
        label={label}
        rows={['00:00']}
        columns={['Mon']}
        values={[[0]]}
      />
    );

    expect(
      screen.getByRole('img', { name: label })
    ).toHaveAccessibleDescription('');
  });

  it('keeps the description out of sight', async () => {
    const label = 'Carbon dioxide';

    await renderHeatmap(
      <MatrixHeatmap
        label={label}
        rows={['00:00']}
        columns={['Mon']}
        values={[[null]]}
      />
    );

    const describedBy = screen
      .getByRole('img', { name: label })
      .getAttribute('aria-describedby');
    expect(document.getElementById(describedBy ?? '')).toHaveClass('sr-only');
  });

  it('renders the scale legend when scale labels are given', async () => {
    await renderHeatmap(
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

  it('adds the no-data key to the legend when a cell has no measurement', async () => {
    const { container } = await renderHeatmap(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={['00:00']}
        columns={weekdayColumns}
        values={[[480, null]]}
        scaleLabels={{ less: 'Lower', more: 'Higher' }}
      />
    );

    expect(
      container.querySelector('[data-slot="heatmap-scale-legend"]')
    ).toHaveTextContent(defaultEmptyLabel);
  });

  it('leaves the no-data key out when every cell is measured', async () => {
    await renderHeatmap(
      <MatrixHeatmap
        label="Carbon dioxide"
        rows={hourRows}
        columns={weekdayColumns}
        values={carbonDioxideValues}
        scaleLabels={{ less: 'Lower', more: 'Higher' }}
      />
    );

    expect(
      screen.queryByText(new RegExp(defaultEmptyLabel))
    ).not.toBeInTheDocument();
  });

  it('renders no scale legend by default', async () => {
    await renderHeatmap(
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
