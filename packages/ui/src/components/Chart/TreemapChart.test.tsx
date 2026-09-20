import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TreemapChart, type TreemapChartNode } from '.';

const spendingNodes: TreemapChartNode[] = [
  { id: 'rent', label: 'Rent', value: 60 },
  { id: 'food', label: 'Food', value: 30 },
  { id: 'books', label: 'Books', value: 10 },
];

const groupedNodes: TreemapChartNode[] = [
  { id: 'rent', label: 'Rent', value: 60, group: 'Home' },
  { id: 'power', label: 'Power', value: 20, group: 'Home' },
  { id: 'food', label: 'Food', value: 30, group: 'Daily' },
  { id: 'books', label: 'Books', value: 10, group: 'Daily' },
];

/** Values that leave a labelled part in the corner the group name wants. */
const cornerContestedNodes: TreemapChartNode[] = [
  { id: 'rent', label: 'Rent', value: 50, group: 'Home' },
  { id: 'food', label: 'Food', value: 25, group: 'Home' },
  { id: 'gas', label: 'Gas', value: 15, group: 'Home' },
  { id: 'tea', label: 'Tea', value: 9, group: 'Home' },
  { id: 'soap', label: 'Soap', value: 1, group: 'Home' },
];

/** A node whose id reads like the group name its sibling belongs to. */
const collidingNodes: TreemapChartNode[] = [
  { id: 'rent', label: 'Rent', value: 60, group: 'Home' },
  { id: 'Home', label: 'Reserve', value: 40 },
];

const bothInputOrders = [
  { description: 'the grouped node comes first', nodes: collidingNodes },
  {
    description: 'the ungrouped node comes first',
    nodes: [...collidingNodes].reverse(),
  },
];

function tiles(container: HTMLElement): Element[] {
  return Array.from(
    container.querySelectorAll('[data-slot="treemap-chart-tile"]')
  );
}

function tileShowing(container: HTMLElement, label: string): Element {
  const [tile] = tiles(container).filter((candidate) =>
    (candidate.getAttribute('aria-label') ?? '').includes(`${label},`)
  );
  return tile;
}

function tileFills(container: HTMLElement): string[] {
  return tiles(container).map(
    (tile) => tile.querySelector('rect')?.getAttribute('fill') ?? ''
  );
}

function tileAreas(container: HTMLElement): number[] {
  return tiles(container).map((tile) => {
    const rect = tile.querySelector('rect');
    return (
      Number(rect?.getAttribute('width')) * Number(rect?.getAttribute('height'))
    );
  });
}

function tileLabels(container: HTMLElement): string[] {
  return tiles(container).flatMap((tile) =>
    Array.from(tile.querySelectorAll('text'), (text) => text.textContent ?? '')
  );
}

function groupLabels(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll('[data-slot="treemap-chart-group"] text'),
    (text) => text.textContent ?? ''
  );
}

function tileNames(container: HTMLElement): string[] {
  return tiles(container).map((tile) => tile.getAttribute('aria-label') ?? '');
}

function tableRows(label: string): string[][] {
  const table = screen.getByRole('table', { name: label });
  return within(table)
    .getAllByRole('row')
    .map((row) =>
      Array.from(
        row.querySelectorAll('th, td'),
        (cell) => cell.textContent ?? ''
      )
    );
}

function tooltipText(container: HTMLElement): string {
  return (
    container.querySelector('[data-slot="chart-tooltip"]')?.textContent ?? ''
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('TreemapChart', () => {
  it('names the chart surface with the label', () => {
    const label = 'Where the January 2026 spending went';

    render(<TreemapChart label={label} nodes={spendingNodes} />);

    expect(
      screen.getByRole('application', { name: label })
    ).toBeInTheDocument();
  });

  it('draws one tile per node', () => {
    const { container } = render(
      <TreemapChart label="Spending" nodes={spendingNodes} />
    );

    expect(tiles(container)).toHaveLength(spendingNodes.length);
  });

  it('gives a tile area in proportion to its value', () => {
    const { container } = render(
      <TreemapChart
        label="Spending"
        nodes={[
          { id: 'half', label: 'Half', value: 50 },
          { id: 'quarter', label: 'Quarter', value: 25 },
          { id: 'rest', label: 'Rest', value: 25 },
        ]}
      />
    );

    const areas = tileAreas(container);

    expect(areas[0] / areas[1]).toBeCloseTo(2, 1);
  });

  it.each([
    { description: 'a hundredth of the whole', minor: 10 },
    { description: 'a tenth of the whole', minor: 100 },
  ])(
    'keeps a grouped tile proportional when its group holds $description',
    ({ minor }) => {
      const major = 1000 - minor;
      const { container } = render(
        <TreemapChart
          label="Spending"
          nodes={[
            { id: 'major', label: 'Major', value: major, group: 'Larger' },
            { id: 'minor', label: 'Minor', value: minor, group: 'Smaller' },
          ]}
        />
      );

      const areas = tileAreas(container);
      const expectedRatio = major / minor;

      expect(Math.min(...areas)).toBeGreaterThan(0);
      expect(areas[0] / areas[1]).toBeGreaterThan(expectedRatio * 0.9);
      expect(areas[0] / areas[1]).toBeLessThan(expectedRatio * 1.1);
    }
  );

  it.each([
    { description: 'a hundredth of the whole', minor: 10 },
    { description: 'a tenth of the whole', minor: 100 },
  ])(
    'draws a grouped tile worth $description at a usable size',
    ({ minor }) => {
      const { container } = render(
        <TreemapChart
          label="Spending"
          nodes={[
            {
              id: 'major',
              label: 'Major',
              value: 1000 - minor,
              group: 'Larger',
            },
            { id: 'minor', label: 'Minor', value: minor, group: 'Smaller' },
          ]}
        />
      );

      const smallest = tiles(container)[1].querySelector('rect');

      expect(Number(smallest?.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(smallest?.getAttribute('height'))).toBeGreaterThan(0);
    }
  );

  it('leaves a zero-value node out of the drawing', () => {
    const nodes = [...spendingNodes, { id: 'tea', label: 'Tea', value: 0 }];

    const { container } = render(
      <TreemapChart label="Spending" nodes={nodes} />
    );

    expect(tiles(container)).toHaveLength(spendingNodes.length);
  });

  it('keeps a zero-value node in the table alternative', () => {
    const label = 'Spending';
    const nodes = [...spendingNodes, { id: 'tea', label: 'Tea', value: 0 }];

    render(<TreemapChart label={label} nodes={nodes} />);

    expect(tableRows(label)).toContainEqual(['Tea', '0', '0%']);
  });

  it.each([
    { description: 'negative', value: -20 },
    { description: 'not a number', value: Number.NaN },
    { description: 'infinite', value: Number.POSITIVE_INFINITY },
  ])('leaves out a node whose value is $description', ({ value }) => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const label = 'Spending';
    const nodes = [...spendingNodes, { id: 'refund', label: 'Refund', value }];

    const { container } = render(<TreemapChart label={label} nodes={nodes} />);

    expect(tiles(container)).toHaveLength(spendingNodes.length);
    expect(tableRows(label).flat()).not.toContain('Refund');
  });

  it('reports a node it cannot give area to', () => {
    const reportSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const nodes = [
      ...spendingNodes,
      { id: 'refund', label: 'Refund', value: -20 },
    ];

    render(<TreemapChart label="Spending" nodes={nodes} />);

    expect(reportSpy).toHaveBeenCalledWith(expect.stringContaining('refund'));
  });

  it('drops a node it cannot give area to without reporting in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();
    const reportSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    // The flag is read when the module loads, and a fresh copy of the library
    // has to come with a matching React for the hooks inside it.
    const { render: renderInProduction } = await import(
      '@testing-library/react'
    );
    const { TreemapChart: ProductionTreemapChart } = await import('.');

    const { container } = renderInProduction(
      <ProductionTreemapChart
        label="Spending"
        nodes={[
          ...spendingNodes,
          { id: 'refund', label: 'Refund', value: -20 },
        ]}
      />
    );

    expect(tiles(container)).toHaveLength(spendingNodes.length);
    expect(reportSpy).not.toHaveBeenCalled();
  });

  it('splits the share evenly between two values whose sum would overflow', () => {
    const label = 'Spending';
    const beyondHalfTheRange = 1e308;

    render(
      <TreemapChart
        label={label}
        nodes={[
          { id: 'first', label: 'First', value: beyondHalfTheRange },
          { id: 'second', label: 'Second', value: beyondHalfTheRange },
        ]}
        valueFormatter={() => 'immense'}
      />
    );

    expect(tableRows(label)).toEqual([
      ['Label', 'Value', 'Share'],
      ['First', 'immense', '50%'],
      ['Second', 'immense', '50%'],
    ]);
  });

  it('lists every node with its value and share in the table alternative', () => {
    const label = 'Spending';

    render(
      <TreemapChart
        label={label}
        nodes={spendingNodes}
        valueFormatter={(value) => `¥${value}k`}
      />
    );

    expect(tableRows(label)).toEqual([
      ['Label', 'Value', 'Share'],
      ['Rent', '¥60k', '60%'],
      ['Food', '¥30k', '30%'],
      ['Books', '¥10k', '10%'],
    ]);
  });

  it('hides the table alternative through a wrapper the clip can size', () => {
    const label = 'Spending';

    render(<TreemapChart label={label} nodes={spendingNodes} />);

    const table = screen.getByRole('table', { name: label });

    expect(table).not.toHaveClass('sr-only');
    expect(table.parentElement).toHaveClass('sr-only');
  });

  it.each([
    { description: 'a share of a fifth', value: 250, expected: '20%' },
    { description: 'a share below half a percent', value: 2, expected: '<1%' },
    { description: 'no share at all', value: 0, expected: '0%' },
  ])('reports $expected for $description', ({ value, expected }) => {
    const label = 'Spending';
    const nodes = [
      { id: 'rent', label: 'Rent', value: 1000 },
      { id: 'stamps', label: 'Stamps', value },
    ];

    render(
      <TreemapChart
        label={label}
        nodes={nodes}
        valueFormatter={(amount) => String(amount)}
      />
    );

    expect(tableRows(label)).toContainEqual([
      'Stamps',
      String(value),
      expected,
    ]);
  });

  it('names a tile whose share rounds down to nothing with less than a percent', () => {
    const { container } = render(
      <TreemapChart
        label="Spending"
        nodes={[
          { id: 'rent', label: 'Rent', value: 1000 },
          { id: 'stamps', label: 'Stamps', value: 2 },
        ]}
        valueFormatter={(amount) => String(amount)}
      />
    );

    expect(tileNames(container)[1]).toBe('Stamps, 2, <1%');
  });

  it('adds a group column to the table alternative when nodes are grouped', () => {
    const label = 'Spending';

    render(<TreemapChart label={label} nodes={groupedNodes} />);

    expect(tableRows(label)[0]).toEqual(['Group', 'Label', 'Value', 'Share']);
    expect(tableRows(label)[1]).toEqual(['Home', 'Rent', '60', '50%']);
  });

  it.each(bothInputOrders)(
    'keeps an ungrouped node out of a group named like its id when $description',
    ({ nodes }) => {
      const label = 'Spending';

      render(
        <TreemapChart
          label={label}
          nodes={nodes}
          valueFormatter={(value) => `¥${value}k`}
        />
      );

      expect(tableRows(label)).toContainEqual(['Home', 'Rent', '¥60k', '60%']);
      expect(tableRows(label)).toContainEqual(['', 'Reserve', '¥40k', '40%']);
    }
  );

  it.each(bothInputOrders)(
    'draws an ungrouped node as its own region when $description',
    ({ nodes }) => {
      const { container } = render(
        <TreemapChart label="Spending" nodes={nodes} />
      );

      const fills = tileFills(container);

      expect(fills).toHaveLength(2);
      expect(fills[0]).not.toBe(fills[1]);
    }
  );

  it.each(bothInputOrders)(
    'counts only its own members in a group total when $description',
    ({ nodes }) => {
      const { container } = render(
        <TreemapChart
          label="Spending"
          nodes={nodes}
          valueFormatter={(value) => `¥${value}k`}
        />
      );

      fireEvent.mouseOver(tileShowing(container, 'Rent'));

      expect(tooltipText(container)).toContain('Home¥60k');
    }
  );

  it.each(bothInputOrders)(
    'leaves the group total out of an ungrouped tile when $description',
    ({ nodes }) => {
      const { container } = render(
        <TreemapChart
          label="Spending"
          nodes={nodes}
          valueFormatter={(value) => `¥${value}k`}
        />
      );

      fireEvent.mouseOver(tileShowing(container, 'Reserve'));

      expect(tooltipText(container)).not.toContain('Home');
    }
  );

  it('gives every tile one color when no node has a group', () => {
    const { container } = render(
      <TreemapChart label="Spending" nodes={spendingNodes} />
    );

    expect(tileFills(container)).toEqual([
      'var(--color-chart-1)',
      'var(--color-chart-1)',
      'var(--color-chart-1)',
    ]);
  });

  it('gives every part of a group the color of its group', () => {
    const { container } = render(
      <TreemapChart label="Spending" nodes={groupedNodes} />
    );

    expect(tileFills(container)).toEqual([
      'var(--color-chart-1)',
      'var(--color-chart-1)',
      'var(--color-chart-2)',
      'var(--color-chart-2)',
    ]);
  });

  it('tiles the parts of a group inside one group area', () => {
    const { container } = render(
      <TreemapChart label="Spending" nodes={groupedNodes} />
    );

    const groups = container.querySelectorAll(
      '[data-slot="treemap-chart-group"]'
    );

    expect(groups).toHaveLength(2);
  });

  it('names a group where the name fits and no part has claimed the spot', () => {
    const { container } = render(
      <TreemapChart label="Spending" nodes={groupedNodes} />
    );

    expect(groupLabels(container)).toEqual(['Home', 'Daily']);
  });

  it('sets a group name apart from the labels of its parts', () => {
    const { container } = render(
      <TreemapChart label="Spending" nodes={groupedNodes} />
    );

    const groupText = container.querySelector(
      '[data-slot="treemap-chart-group"] text'
    );
    const tileText = container.querySelector(
      '[data-slot="treemap-chart-tile"] text'
    );

    expect(groupText?.getAttribute('fill')).toBe('var(--color-base-white)');
    expect(tileText?.getAttribute('fill')).toBe('var(--color-base-black)');
  });

  it('keeps the label of a part that sits where the group name would go', () => {
    const { container } = render(
      <TreemapChart label="Spending" nodes={cornerContestedNodes} />
    );

    expect(tileLabels(container)).toContain('Soap');
  });

  it('drops the group name where a part has claimed the spot', () => {
    const { container } = render(
      <TreemapChart label="Spending" nodes={cornerContestedNodes} />
    );

    expect(groupLabels(container)).toEqual([]);
  });

  it('colors tiles on the sequential scale when colorBy is value', () => {
    const { container } = render(
      <TreemapChart
        label="Spending"
        colorBy="value"
        nodes={[
          { id: 'most', label: 'Most', value: 100 },
          { id: 'least', label: 'Least', value: 25 },
        ]}
      />
    );

    expect(tileFills(container)).toEqual([
      'color-mix(in srgb, var(--color-chart-1) 100%, var(--color-base-white))',
      'color-mix(in srgb, var(--color-chart-1) 40%, var(--color-base-white))',
    ]);
  });

  it('names every tile with its label, value and share', () => {
    const { container } = render(
      <TreemapChart
        label="Spending"
        nodes={groupedNodes}
        valueFormatter={(value) => `¥${value}k`}
      />
    );

    expect(tileNames(container)[0]).toBe('Home, Rent, ¥60k, 50%');
  });

  it('exposes every tile under a role that carries its name', () => {
    render(
      <TreemapChart
        label="Spending"
        nodes={spendingNodes}
        valueFormatter={(value) => `¥${value}k`}
      />
    );

    expect(
      screen.getByRole('img', { name: 'Rent, ¥60k, 60%' })
    ).toBeInTheDocument();
  });

  it('makes every tile reachable by keyboard', () => {
    const { container } = render(
      <TreemapChart label="Spending" nodes={spendingNodes} />
    );

    const tabIndexes = tiles(container).map((tile) =>
      tile.getAttribute('tabindex')
    );

    expect(tabIndexes).toEqual(['0', '0', '0']);
  });

  it('shows the label, value and share of the hovered tile', () => {
    const { container } = render(
      <TreemapChart
        label="Spending"
        nodes={spendingNodes}
        valueFormatter={(value) => `¥${value}k`}
      />
    );

    fireEvent.mouseOver(tiles(container)[0]);

    expect(tooltipText(container)).toContain('Rent');
    expect(tooltipText(container)).toContain('¥60k');
    expect(tooltipText(container)).toContain('60%');
  });

  it('omits the label of a tile too small to hold it', () => {
    const { container } = render(
      <TreemapChart
        label="Spending"
        nodes={[
          { id: 'rent', label: 'Rent', value: 980 },
          { id: 'stationery', label: 'Stationery', value: 10 },
          { id: 'tea', label: 'Tea', value: 10 },
        ]}
      />
    );

    expect(tileLabels(container)).toEqual(['Rent']);
  });

  it('draws no tile for an empty node list', () => {
    const { container } = render(<TreemapChart label="Spending" nodes={[]} />);

    expect(tiles(container)).toHaveLength(0);
  });
});
