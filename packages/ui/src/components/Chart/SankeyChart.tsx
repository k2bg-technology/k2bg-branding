'use client';

import {
  Rectangle,
  Sankey,
  type SankeyNodeProps,
  Tooltip,
  type TooltipContentProps,
  usePlotArea,
} from 'recharts';

import { ChartContainer } from './ChartContainer';
import { ChartTooltip } from './ChartTooltip';
import { chartAccessibleName, resolveSeriesColor } from './chartTheme';
import { defaultValueFormatter } from './chartTicks';
import type { ChartColor, ChartHeight, ChartTooltipData } from './types';

export interface SankeyChartNode {
  id: string;
  label: string;
  color?: ChartColor;
}

export interface SankeyChartLink {
  source: string;
  target: string;
  value: number;
}

// Sinks sit in the right column with inward labels, so only a gutter is needed.
const nodeColumnGutter = 16;
const nodeLabelGap = 8;

function readNodeName(candidate: unknown): string | undefined {
  if (
    typeof candidate === 'object' &&
    candidate !== null &&
    'name' in candidate &&
    typeof candidate.name === 'string'
  ) {
    return candidate.name;
  }
  return undefined;
}

interface HoveredElement {
  heading: string;
  swatchNodeName: string;
}

// Entries wrap the hovered element as `{ payload, name, value }`; only a link
// payload resolves `source` / `target`, which tells a flow from a node total.
function hoveredElement(entryPayload: unknown): HoveredElement | undefined {
  if (
    typeof entryPayload !== 'object' ||
    entryPayload === null ||
    !('payload' in entryPayload)
  ) {
    return undefined;
  }
  const element = entryPayload.payload;
  if (typeof element !== 'object' || element === null) {
    return undefined;
  }
  if ('source' in element && 'target' in element) {
    const source = readNodeName(element.source);
    const target = readNodeName(element.target);
    if (source === undefined || target === undefined) {
      return undefined;
    }
    return { heading: `${source} → ${target}`, swatchNodeName: source };
  }
  const name = readNodeName(element);
  return name === undefined
    ? undefined
    : { heading: name, swatchNodeName: name };
}

type NodeShapeProps = SankeyNodeProps & { nodes: SankeyChartNode[] };

function SankeyNodeShape({ nodes, index, ...rect }: NodeShapeProps) {
  const plotArea = usePlotArea();
  // Recharts keeps the computed nodes in the order they were handed over,
  // so the index maps straight back to the caller's node.
  const node = nodes[index];

  // Labels in the right half read back inward, so the anchor flips there.
  const isRightHalf =
    plotArea !== undefined && rect.x > plotArea.x + plotArea.width / 2;

  return (
    <>
      <Rectangle
        className="recharts-sankey-node"
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        fill={resolveSeriesColor(node, index)}
      />
      <text
        x={
          isRightHalf
            ? rect.x - nodeLabelGap
            : rect.x + rect.width + nodeLabelGap
        }
        y={rect.y + rect.height / 2}
        textAnchor={isRightHalf ? 'end' : 'start'}
        dominantBaseline="middle"
        fontSize={12}
        fill="var(--color-base-black)"
        fillOpacity={0.8}
      >
        {node.label}
      </text>
    </>
  );
}

export interface SankeyChartProps {
  label: string;
  nodes: SankeyChartNode[];
  links: SankeyChartLink[];
  height?: ChartHeight;
  valueFormatter?: (value: number) => string;
  className?: string;
}

export function SankeyChart({
  label,
  nodes,
  links,
  height,
  valueFormatter = defaultValueFormatter,
  className,
}: SankeyChartProps) {
  const nodeIndexById = new Map(nodes.map((node, index) => [node.id, index]));
  const nodeColorByName = new Map(
    nodes.map((node, index) => [node.label, resolveSeriesColor(node, index)])
  );

  // Recharts addresses nodes by array index and crashes the layout on an
  // unknown one, so links to missing nodes are dropped rather than passed on.
  const data = {
    nodes: nodes.map((node) => ({ name: node.label })),
    links: links.flatMap((link) => {
      const source = nodeIndexById.get(link.source);
      const target = nodeIndexById.get(link.target);
      if (source === undefined || target === undefined) {
        return [];
      }
      return { source, target, value: link.value };
    }),
  };

  const toTooltipData = ({
    payload,
  }: TooltipContentProps): ChartTooltipData => {
    const entry = payload?.[0];
    const element = hoveredElement(entry?.payload);
    if (entry === undefined || element === undefined) {
      return { heading: '', items: [] };
    }
    return {
      heading: element.heading,
      items: [
        {
          id: element.heading,
          label: '',
          color: nodeColorByName.get(element.swatchNodeName) ?? '',
          value:
            typeof entry.value === 'number'
              ? valueFormatter(entry.value)
              : String(entry.value ?? ''),
        },
      ],
    };
  };

  return (
    <div data-slot="sankey-chart" className={className}>
      <ChartContainer height={height}>
        <Sankey
          data={data}
          margin={{ top: 8, right: nodeColumnGutter, bottom: 8, left: 8 }}
          node={(nodeProps: SankeyNodeProps) => (
            <SankeyNodeShape {...nodeProps} nodes={nodes} />
          )}
          // Recharts hardcodes #333 at 0.2 opacity on the default link shape;
          // these three properties are spread after it and win.
          link={{
            stroke: 'var(--color-base-default)',
            strokeOpacity: 0.25,
            fill: 'none',
          }}
          {...chartAccessibleName(label)}
        >
          <Tooltip
            content={(tooltipProps: TooltipContentProps) => {
              if (!tooltipProps.active || tooltipProps.payload?.length === 0) {
                return null;
              }
              return <ChartTooltip data={toTooltipData(tooltipProps)} />;
            }}
            isAnimationActive={false}
          />
        </Sankey>
      </ChartContainer>
    </div>
  );
}
