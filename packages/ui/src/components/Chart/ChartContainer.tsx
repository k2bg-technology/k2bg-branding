'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';

import { cn } from '../../utils/cn';

/**
 * Recharts hardcodes neutral colors as SVG attributes; CSS properties
 * take precedence over presentation attributes, so these selectors
 * restyle grid, ticks, cursors, and dots with design tokens. The chart
 * surface stays focusable (Recharts' accessibility layer) and keeps the
 * browser's default focus ring; only inner layers drop theirs.
 */
const chartContainerVariants = cva(
  [
    'flex w-full justify-center text-caption',
    '[&_.recharts-cartesian-axis-tick_text]:fill-base-dark',
    '[&_.recharts-cartesian-grid_line]:stroke-base-light/50',
    '[&_.recharts-curve.recharts-tooltip-cursor]:stroke-base-light',
    '[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-base-light/50',
    '[&_.recharts-reference-line_line]:stroke-base-light',
    "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
    "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
    '[&_.recharts-layer]:outline-hidden',
    '[&_.recharts-sector]:outline-hidden',
  ],
  {
    variants: {
      height: {
        sm: 'h-48',
        md: 'h-64',
        lg: 'h-80',
      },
    },
    defaultVariants: {
      height: 'md',
    },
  }
);

interface Props extends VariantProps<typeof chartContainerVariants> {
  children: ReactElement;
  className?: string;
}

export function ChartContainer({ height, children, className }: Props) {
  return (
    <div
      data-slot="chart"
      className={cn(chartContainerVariants({ height }), className)}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 520, height: 256 }}
      >
        {children}
      </ResponsiveContainer>
    </div>
  );
}
