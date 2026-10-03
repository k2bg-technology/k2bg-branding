'use client';

import {
  Tooltip,
  type TooltipContentProps,
  Treemap,
  type TreemapNode,
} from 'recharts';

import { ChartContainer } from './ChartContainer';
import { ChartTooltip } from './ChartTooltip';
import { heatmapCellColor, heatmapLevel } from './chartHeatmapScale';
import {
  chartAccessibleName,
  resolveSeriesColor,
  seriesColorCss,
} from './chartTheme';
import { defaultValueFormatter } from './chartTicks';
import {
  ChartColor,
  type ChartHeight,
  type ChartTooltipData,
  type ChartTooltipItem,
} from './types';

export interface TreemapChartNode {
  id: string;
  /** Display label, already localized by the consuming app. */
  label: string;
  /** Finite and at or above zero; a zero keeps its table row but takes no area. */
  value: number;
  /** One optional level of grouping; the parts of a group tile the group's area. */
  group?: string;
}

/** What the treemap reads: `value` and `name`; the key rides along to the shapes. */
type TileDatum = { tileId: string; name: string; value: number };
type GroupDatum = { groupKey: string; name: string; children: TileDatum[] };

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TileDetail {
  label: string;
  color: string;
  valueLabel: string;
  shareLabel: string;
  accessibleName: string;
  groupKey?: string;
}

interface GroupDetail {
  name: string;
  color: string;
  valueLabel: string;
}

const labelFontSize = 12;
const labelPlatePaddingX = 4;
const labelPlatePaddingY = 2;
/** Gap between the edge of an area and the label plate inside it. */
const labelInset = 4;
/** Hairlines part touching tiles without taking any area from them. */
const tileStrokeWidth = 1;
const groupStrokeWidth = 2;
/** Base color of the sequential scale used by `colorBy="value"`. */
const scaleColor = ChartColor.CHART_1;

// Bundlers replace this expression, so the report leaves production builds.
declare const process: { env: { NODE_ENV?: string } };
const isDevelopment = process.env.NODE_ENV !== 'production';

function isDrawableValue(value: number) {
  return Number.isFinite(value) && value >= 0;
}

/** Rough advance width: a full-width glyph fills the em, a Latin one ~0.6em. */
function estimateTextWidth(text: string) {
  return Array.from(text).reduce((width, character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return width + (codePoint >= 0x1100 ? labelFontSize : labelFontSize * 0.6);
  }, 0);
}

/**
 * Where the label plate goes inside `area`, or undefined where the area is too
 * small to hold it. An opaque plate rather than text straight on the fill: no
 * palette color reaches 4.5:1 against either text token, while base-black on
 * base-white reaches 8:1. The plate is drawn over the area, never reserved out
 * of it, so a label never costs a tile the area its value earned.
 */
function labelPlate(
  text: string,
  area: Rect,
  corner: 'topLeft' | 'bottomRight'
): Rect | undefined {
  if (text === '') {
    return undefined;
  }
  const width = estimateTextWidth(text) + labelPlatePaddingX * 2;
  const height = labelFontSize + labelPlatePaddingY * 2;
  const fits =
    area.width >= width + labelInset * 2 &&
    area.height >= height + labelInset * 2;
  if (!fits) {
    return undefined;
  }
  return {
    x:
      corner === 'topLeft'
        ? area.x + labelInset
        : area.x + area.width - labelInset - width,
    y:
      corner === 'topLeft'
        ? area.y + labelInset
        : area.y + area.height - labelInset - height,
    width,
    height,
  };
}

function overlaps(one: Rect, other: Rect) {
  return (
    one.x < other.x + other.width &&
    other.x < one.x + one.width &&
    one.y < other.y + other.height &&
    other.y < one.y + one.height
  );
}

function readRect(node: TreemapNode): Rect {
  return { x: node.x, y: node.y, width: node.width, height: node.height };
}

function readTileId(candidate: unknown) {
  if (
    typeof candidate === 'object' &&
    candidate !== null &&
    'tileId' in candidate &&
    typeof candidate.tileId === 'string'
  ) {
    return candidate.tileId;
  }
  return undefined;
}

function readGroupKey(candidate: unknown) {
  if (
    typeof candidate === 'object' &&
    candidate !== null &&
    'groupKey' in candidate &&
    typeof candidate.groupKey === 'string'
  ) {
    return candidate.groupKey;
  }
  return undefined;
}

/**
 * A group reads as a group rather than as one more part: its plate is the
 * inverted one, in a heavier type. Both tones are opaque and reach 8:1.
 */
const labelTones = {
  tile: {
    plate: 'var(--color-base-white)',
    ink: 'var(--color-base-black)',
    weight: 'normal',
  },
  group: {
    plate: 'var(--color-base-black)',
    ink: 'var(--color-base-white)',
    weight: 500,
  },
} as const;

interface LabelProps {
  plate: Rect;
  text: string;
  tone: keyof typeof labelTones;
}

function TreemapLabel({ plate, text, tone }: LabelProps) {
  const { plate: plateFill, ink, weight } = labelTones[tone];
  return (
    <>
      <rect
        x={plate.x}
        y={plate.y}
        width={plate.width}
        height={plate.height}
        rx={2}
        fill={plateFill}
      />
      <text
        x={plate.x + labelPlatePaddingX}
        y={plate.y + plate.height / 2}
        fontSize={labelFontSize}
        fontWeight={weight}
        dominantBaseline="middle"
        fill={ink}
      >
        {text}
      </text>
    </>
  );
}

interface GroupOverlayProps {
  node: TreemapNode;
  name: string;
  tiles: Map<string, TileDetail>;
}

function TreemapGroupOverlay({ node, name, tiles }: GroupOverlayProps) {
  const area = readRect(node);
  // The far corner from the tile labels, and dropped outright where a part of
  // the group has claimed the spot: a part never loses its own name to a group.
  const plate = labelPlate(name, area, 'bottomRight');
  const isPlateTaken = (node.children ?? []).some((child) => {
    const tile = tiles.get(readTileId(child) ?? '');
    const tilePlate =
      tile === undefined
        ? undefined
        : labelPlate(tile.label, readRect(child), 'topLeft');
    return (
      plate !== undefined &&
      tilePlate !== undefined &&
      overlaps(plate, tilePlate)
    );
  });

  return (
    <g data-slot="treemap-chart-group">
      <rect
        x={area.x}
        y={area.y}
        width={area.width}
        height={area.height}
        rx={2}
        fill="none"
        stroke="var(--color-base-white)"
        strokeWidth={groupStrokeWidth}
      />
      {plate !== undefined && !isPlateTaken && (
        <TreemapLabel plate={plate} text={name} tone="group" />
      )}
    </g>
  );
}

interface NodeShapeProps {
  node: TreemapNode;
  tiles: Map<string, TileDetail>;
  groups: Map<string, GroupDetail>;
}

function TreemapNodeShape({ node, tiles, groups }: NodeShapeProps) {
  const tileId = readTileId(node);
  const tile = tileId === undefined ? undefined : tiles.get(tileId);
  if (tile === undefined) {
    // A group draws nothing of its own: its outline and label are painted by
    // its last tile, because SVG paints a parent underneath its children.
    return <g />;
  }

  const area = readRect(node);
  const parent = node.root;
  const groupKey = parent === undefined ? undefined : readGroupKey(parent);
  const group = groupKey === undefined ? undefined : groups.get(groupKey);

  // A label that fits its tile is always drawn; the group name gives way.
  const plate = labelPlate(tile.label, area, 'topLeft');
  const isLastOfGroup =
    group !== undefined && node.index === (parent?.children?.length ?? 0) - 1;

  return (
    <>
      {/* biome-ignore lint/a11y/noInteractiveElementToNoninteractiveRole: WCAG 2.1.1 keeps the tile focusable, and img is the role that lets a graphic carry a name */}
      <g
        data-slot="treemap-chart-tile"
        role="img"
        aria-label={tile.accessibleName}
        tabIndex={0}
      >
        <rect
          x={area.x}
          y={area.y}
          width={area.width}
          height={area.height}
          rx={2}
          fill={tile.color}
          stroke="var(--color-base-white)"
          strokeWidth={tileStrokeWidth}
        />
        {plate !== undefined && (
          <TreemapLabel plate={plate} text={tile.label} tone="tile" />
        )}
      </g>
      {isLastOfGroup && group !== undefined && parent !== undefined && (
        <TreemapGroupOverlay node={parent} name={group.name} tiles={tiles} />
      )}
    </>
  );
}

export interface TreemapChartProps {
  label: string;
  nodes: TreemapChartNode[];
  /** Tile color: one per group from the palette, or the value on a scale. */
  colorBy?: 'group' | 'value';
  height?: ChartHeight;
  valueFormatter?: (value: number) => string;
  className?: string;
}

export function TreemapChart({
  label,
  nodes,
  colorBy = 'group',
  height,
  valueFormatter = defaultValueFormatter,
  className,
}: TreemapChartProps) {
  const drawableNodes = nodes.filter((node) => isDrawableValue(node.value));
  if (isDevelopment && drawableNodes.length < nodes.length) {
    const droppedIds = nodes
      .filter((node) => !isDrawableValue(node.value))
      .map((node) => node.id);
    console.error(
      `TreemapChart: dropped ${droppedIds.join(', ')} because a treemap can only give area to a finite value at or above zero.`
    );
  }

  const isGrouped = drawableNodes.some((node) => node.group !== undefined);
  // Membership comes from `group` alone. The two key spaces never meet, so a
  // node whose id reads like a group name still stands on its own.
  const regionKeyOf = (node: TreemapChartNode) =>
    node.group === undefined ? `node:${node.id}` : `group:${node.group}`;
  const regionKeys = Array.from(
    new Set(drawableNodes.map((node) => regionKeyOf(node)))
  );
  const regions = regionKeys.map((key) => {
    const members = drawableNodes.filter((node) => regionKeyOf(node) === key);
    return { key, name: members[0]?.group, members };
  });
  const regionIndexByKey = new Map(
    regionKeys.map((key, index) => [key, index])
  );

  const largestValue = Math.max(0, ...drawableNodes.map((node) => node.value));
  // Shares and areas are ratios, so they are taken from values measured against
  // the largest one: a sum of finite values then cannot overflow to Infinity.
  const scaled = (value: number) =>
    largestValue === 0 ? 0 : value / largestValue;
  const total = drawableNodes.reduce(
    (sum, node) => sum + scaled(node.value),
    0
  );
  // A share that rounds down to nothing is still not nothing.
  const shareLabel = (value: number) => {
    if (total === 0 || value === 0) {
      return '0%';
    }
    const percentage = Math.round((scaled(value) / total) * 100);
    return percentage === 0 ? '<1%' : `${percentage}%`;
  };
  // Without groups the color carries no meaning, so it does not vary either.
  const regionColor = (key: string) =>
    resolveSeriesColor({}, isGrouped ? (regionIndexByKey.get(key) ?? 0) : 0);
  const tileColor = (node: TreemapChartNode) =>
    colorBy === 'value'
      ? heatmapCellColor(heatmapLevel(node.value, 0, largestValue), scaleColor)
      : regionColor(regionKeyOf(node));

  const tiles = new Map(
    drawableNodes.map((node) => {
      const valueLabel = valueFormatter(node.value);
      const share = shareLabel(node.value);
      const groupPrefix = node.group === undefined ? '' : `${node.group}, `;
      return [
        node.id,
        {
          label: node.label,
          color: tileColor(node),
          valueLabel,
          shareLabel: share,
          accessibleName: `${groupPrefix}${node.label}, ${valueLabel}, ${share}`,
          groupKey: node.group === undefined ? undefined : regionKeyOf(node),
        },
      ];
    })
  );

  const groupEntries: [string, GroupDetail][] = regions.flatMap((region) => {
    if (region.name === undefined) {
      return [];
    }
    const groupValue = region.members.reduce(
      (sum, node) => sum + node.value,
      0
    );
    return [
      [
        region.key,
        {
          name: region.name,
          // A group has no place on the sequential scale, so its swatch shows
          // the color the scale is built from.
          color:
            colorBy === 'value'
              ? seriesColorCss(scaleColor)
              : regionColor(region.key),
          valueLabel: valueFormatter(groupValue),
        },
      ],
    ];
  });
  const groups = new Map(groupEntries);

  // Zero takes no area, so it is left out of the drawing but kept in the table.
  // The layout reads the measured value for the same reason the shares do.
  const toTileDatum = (node: TreemapChartNode): TileDatum => ({
    tileId: node.id,
    name: node.label,
    value: scaled(node.value),
  });
  const data: (TileDatum | GroupDatum)[] = isGrouped
    ? regions.flatMap((region) => {
        const drawn = region.members.filter((node) => node.value > 0);
        return drawn.length === 0
          ? []
          : {
              groupKey: region.key,
              name: region.name ?? '',
              children: drawn.map(toTileDatum),
            };
      })
    : drawableNodes
        .filter((node) => node.value > 0)
        .map((node) => toTileDatum(node));

  const toTooltipData = ({
    payload,
  }: TooltipContentProps): ChartTooltipData | undefined => {
    const hovered: unknown = payload?.[0]?.payload;
    const tileId = readTileId(hovered);
    const tile = tileId === undefined ? undefined : tiles.get(tileId);
    if (tile === undefined || tileId === undefined) {
      return undefined;
    }
    const group =
      tile.groupKey === undefined ? undefined : groups.get(tile.groupKey);
    // The group total rides along with the part, because a group keeps no area
    // of its own to hover.
    const groupItem: ChartTooltipItem[] =
      group === undefined
        ? []
        : [
            {
              id: `${tileId}-group`,
              label: group.name,
              color: group.color,
              value: group.valueLabel,
            },
          ];
    return {
      heading: tile.label,
      items: [
        {
          id: tileId,
          label: tile.shareLabel,
          color: tile.color,
          value: tile.valueLabel,
        },
        ...groupItem,
      ],
    };
  };

  // Recharts forwards these to the chart svg but does not type them; the role
  // matches the focusable surface its other charts expose.
  const surfaceProps = { role: 'application', ...chartAccessibleName(label) };

  return (
    <div data-slot="treemap-chart" className={className}>
      <ChartContainer height={height}>
        {/* No inset and no gap: every pixel of the plot belongs to a tile, so
            a tile's area stays proportional to its value at any ratio. */}
        <Treemap
          data={data}
          dataKey="value"
          nameKey="name"
          isAnimationActive={false}
          content={(node: TreemapNode) => (
            <TreemapNodeShape node={node} tiles={tiles} groups={groups} />
          )}
          {...surfaceProps}
        >
          <Tooltip
            content={(tooltipProps: TooltipContentProps) => {
              if (!tooltipProps.active || tooltipProps.payload?.length === 0) {
                return null;
              }
              const tooltipData = toTooltipData(tooltipProps);
              return tooltipData === undefined ? null : (
                <ChartTooltip data={tooltipData} />
              );
            }}
            isAnimationActive={false}
          />
        </Treemap>
      </ChartContainer>
      {/* The same numbers, reachable without reading the tiles. A table keeps
          its own width and ignores the clip, so the wrapper is what hides it. */}
      <div data-slot="treemap-chart-table" className="sr-only">
        <table>
          <caption>{label}</caption>
          <thead>
            <tr>
              {isGrouped && <th scope="col">Group</th>}
              <th scope="col">Label</th>
              <th scope="col">Value</th>
              <th scope="col">Share</th>
            </tr>
          </thead>
          <tbody>
            {drawableNodes.map((node) => (
              <tr key={node.id}>
                {isGrouped && <td>{node.group ?? ''}</td>}
                <th scope="row">{node.label}</th>
                <td>{valueFormatter(node.value)}</td>
                <td>{shareLabel(node.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
