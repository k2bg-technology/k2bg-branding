import { z } from 'zod';

import {
  PeriodGrain,
  type PivotRowOrder,
  type PivotTableSection,
  Reduction,
  SectionKind,
} from '../../../../../domain';
import { axisTopNSchema, sortKeyOrderSchema } from './bars';
import {
  identifierSchema,
  reductionSchema,
  sectionControlsSchema,
  sectionIdSchema,
  sectionWidthSchema,
  sourceSchema,
  transformSchema,
  valueFormatSchema,
} from './statTiles';

const rowOrderSchema = z
  .unknown()
  .transform((value, context): PivotRowOrder | typeof z.NEVER => {
    if (value === 'total-desc' || value === 'as-provided') return value;
    if (typeof value === 'string' || value === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid row order',
      });
      return z.NEVER;
    }
    const result = sortKeyOrderSchema.safeParse(value);
    if (result.success) return result.data;
    result.error.issues.forEach((issue) => {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: issue.path,
        message: issue.message,
      });
    });
    return z.NEVER;
  });

const columnsSchema = z.discriminatedUnion('axis', [
  z.strictObject({
    axis: z.literal('time'),
    grain: z
      .enum([PeriodGrain.MONTH, PeriodGrain.WEEK, PeriodGrain.DAY])
      .optional(),
    window: z.number().int().min(1).max(120).optional(),
  }),
  z.strictObject({ axis: z.literal('category'), column: identifierSchema }),
]);

const pivotTableSectionSchemaBase = z.strictObject({
  id: sectionIdSchema,
  title: z.string().min(1),
  source: sourceSchema,
  kind: z.literal(SectionKind.PIVOT_TABLE),
  width: sectionWidthSchema.optional(),
  controls: sectionControlsSchema,
  rows: z.strictObject({
    column: identifierSchema,
    label: z.string().min(1),
    order: rowOrderSchema.default('total-desc'),
    topN: axisTopNSchema.optional(),
  }),
  columns: columnsSchema,
  value: z.strictObject({
    column: identifierSchema,
    reduction: reductionSchema.default(Reduction.SUM),
    transform: transformSchema.optional(),
  }),
  format: valueFormatSchema,
  unit: z.string().min(1).optional(),
  totals: z
    .strictObject({
      column: z.string().min(1).optional(),
      row: z.string().min(1).optional(),
    })
    .refine(
      (totals) => totals.column !== undefined || totals.row !== undefined,
      'totals requires column or row'
    )
    .optional(),
});

export const pivotTableSectionSchema =
  pivotTableSectionSchemaBase satisfies z.ZodType<
    PivotTableSection,
    z.input<typeof pivotTableSectionSchemaBase>
  >;
