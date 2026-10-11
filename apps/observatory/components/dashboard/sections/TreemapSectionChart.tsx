'use client';

import {
  TreemapChart,
  type TreemapChartNode,
  type TreemapChartTableHeaders,
} from 'ui';

import type { ValueFormat } from '../../../modules/dashboard/domain';
import { formatValue } from '../formatValue';

interface Props {
  label: string;
  nodes: TreemapChartNode[];
  tableHeaders: TreemapChartTableHeaders;
  locale: string;
  currency?: string;
  format: ValueFormat;
  unit?: string;
}

// The client creates the formatter callback because functions cannot cross the server boundary.
export function TreemapSectionChart({
  label,
  nodes,
  tableHeaders,
  locale,
  currency,
  format,
  unit,
}: Props) {
  return (
    <TreemapChart
      label={label}
      nodes={nodes}
      tableHeaders={tableHeaders}
      valueFormatter={(value) =>
        formatValue(value, { format, unit }, { locale, currency })
      }
    />
  );
}
