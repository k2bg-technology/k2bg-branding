import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  ChartColor,
  SankeyChart,
  type SankeyChartLink,
  type SankeyChartNode,
} from '.';

const budgetNodes: SankeyChartNode[] = [
  { id: 'income', label: 'Income' },
  { id: 'savings', label: 'Savings' },
  { id: 'spending', label: 'Spending' },
];

const budgetLinks: SankeyChartLink[] = [
  { source: 'income', target: 'savings', value: 3 },
  { source: 'income', target: 'spending', value: 7 },
];

function nodeLabels(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll('.recharts-sankey-nodes text'),
    (label) => label.textContent ?? ''
  );
}

function nodeFills(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll('.recharts-sankey-node'),
    (node) => node.getAttribute('fill') ?? ''
  );
}

function tooltipText(container: HTMLElement): string {
  return (
    container.querySelector('[data-slot="chart-tooltip"]')?.textContent ?? ''
  );
}

function hoverFirstLink(container: HTMLElement): void {
  fireEvent.mouseOver(container.querySelectorAll('.recharts-sankey-link')[0]);
}

describe('SankeyChart', () => {
  it('names the chart surface with the label', () => {
    const label = 'Where the January 2026 income went';

    render(
      <SankeyChart label={label} nodes={budgetNodes} links={budgetLinks} />
    );

    expect(
      screen.getByRole('application', { name: label })
    ).toBeInTheDocument();
  });

  it('labels every node', () => {
    const { container } = render(
      <SankeyChart label="Budget" nodes={budgetNodes} links={budgetLinks} />
    );

    expect(nodeLabels(container)).toEqual(['Income', 'Savings', 'Spending']);
  });

  it('draws one node shape per node', () => {
    const { container } = render(
      <SankeyChart label="Budget" nodes={budgetNodes} links={budgetLinks} />
    );

    expect(container.querySelectorAll('.recharts-sankey-node')).toHaveLength(
      budgetNodes.length
    );
  });

  it('draws one flow per link', () => {
    const { container } = render(
      <SankeyChart label="Budget" nodes={budgetNodes} links={budgetLinks} />
    );

    expect(container.querySelectorAll('.recharts-sankey-link')).toHaveLength(
      budgetLinks.length
    );
  });

  it('drops a link that references an unknown node id', () => {
    const links = [
      ...budgetLinks,
      { source: 'income', target: 'unknown', value: 5 },
    ];

    const { container } = render(
      <SankeyChart label="Budget" nodes={budgetNodes} links={links} />
    );

    expect(container.querySelectorAll('.recharts-sankey-link')).toHaveLength(
      budgetLinks.length
    );
  });

  it('keeps every node when a link is dropped', () => {
    const links = [
      ...budgetLinks,
      { source: 'unknown', target: 'savings', value: 5 },
    ];

    const { container } = render(
      <SankeyChart label="Budget" nodes={budgetNodes} links={links} />
    );

    expect(nodeLabels(container)).toEqual(['Income', 'Savings', 'Spending']);
  });

  it('fills the nodes with the palette in order', () => {
    const { container } = render(
      <SankeyChart label="Budget" nodes={budgetNodes} links={budgetLinks} />
    );

    expect(nodeFills(container)).toEqual([
      'var(--color-chart-1)',
      'var(--color-chart-2)',
      'var(--color-chart-3)',
    ]);
  });

  it('fills a node with its own color instead of the palette one', () => {
    const nodes = budgetNodes.map((node, index) =>
      index === 0 ? { ...node, color: ChartColor.SUCCESS } : node
    );

    const { container } = render(
      <SankeyChart label="Budget" nodes={nodes} links={budgetLinks} />
    );

    expect(nodeFills(container)[0]).toBe('var(--color-success)');
  });

  it('names the hovered flow by its source and target node', () => {
    const { container } = render(
      <SankeyChart label="Budget" nodes={budgetNodes} links={budgetLinks} />
    );

    hoverFirstLink(container);

    expect(tooltipText(container)).toContain('Income → Savings');
  });

  it('formats the hovered flow value with valueFormatter', () => {
    const valueFormatter = (value: number) => `¥${value}0,000`;

    const { container } = render(
      <SankeyChart
        label="Budget"
        nodes={budgetNodes}
        links={budgetLinks}
        valueFormatter={valueFormatter}
      />
    );

    hoverFirstLink(container);

    expect(tooltipText(container)).toContain('¥30,000');
  });

  it('names the hovered node by its label', () => {
    const { container } = render(
      <SankeyChart label="Budget" nodes={budgetNodes} links={budgetLinks} />
    );

    fireEvent.mouseOver(container.querySelectorAll('.recharts-sankey-node')[0]);

    expect(tooltipText(container)).toContain('Income');
  });
});
