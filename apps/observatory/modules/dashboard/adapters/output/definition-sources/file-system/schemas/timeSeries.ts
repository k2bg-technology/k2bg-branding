import { z } from 'zod';

import {
  MAXIMUM_SECTION_BUCKETS,
  parseCalendarDate,
  Reduction,
  SectionGrain,
  SectionKind,
  type TimeSeriesSection,
  type TimeSeriesSeriesDefinition,
} from '../../../../../domain';
import {
  identifierSchema,
  reductionSchema,
  sectionControlsSchema,
  sectionGateFields,
  sectionIdSchema,
  sectionWidthSchema,
  sourceSchema,
  transformSchema,
  valueFormatSchema,
} from './statTiles';

export const seriesSchema = z.strictObject({
  label: z.string().min(1),
  column: identifierSchema,
  reduction: reductionSchema.default(Reduction.SUM),
  transform: transformSchema.optional(),
});

export const interpolationSchema = z.enum(['linear', 'step']);
export const valueBindingSchema = seriesSchema.omit({ label: true });
export const pivotTopNSchema = z.strictObject({
  count: z.number().int().min(1).max(11),
  otherLabel: z.string().min(1),
});

export const movingAverageSchema = z
  .strictObject({
    window: z.number().int().min(2).max(MAXIMUM_SECTION_BUCKETS),
    label: z.string().min(1),
    minimumPoints: z.number().int().min(1).optional(),
  })
  .refine(
    (definition) =>
      definition.minimumPoints === undefined ||
      definition.minimumPoints <= definition.window,
    { message: 'minimumPoints must not exceed window', path: ['minimumPoints'] }
  );
export const runningSchema = z.strictObject({
  kind: z.enum(['sum', 'average']),
  label: z.string().min(1),
});
export const rebaseSchema = z.strictObject({
  kind: z.literal('rebase'),
  base: z
    .union([
      z.literal('first'),
      z.strictObject({
        date: z
          .string()
          .refine(
            (value) => parseCalendarDate(value) !== null,
            'must be a calendar date (YYYY-MM-DD)'
          ),
      }),
    ])
    .optional(),
});
export const derivedSeriesFields = {
  movingAverage: movingAverageSchema.optional(),
  running: runningSchema.optional(),
  normalize: rebaseSchema.optional(),
};

const lineSeriesSchema = seriesSchema.extend({
  interpolation: interpolationSchema.optional(),
  ...derivedSeriesFields,
});
const bandSeriesSchema = z.strictObject({
  label: z.string().min(1),
  low: identifierSchema,
  high: identifierSchema,
  reduction: reductionSchema.default(Reduction.SUM),
  interpolation: interpolationSchema.optional(),
});
// Select the branch first so validation reports the field inside the chosen shape.
const timeSeriesSeriesSchema = z
  .unknown()
  .transform((value, context): TimeSeriesSeriesDefinition | typeof z.NEVER => {
    const schema =
      typeof value === 'object' && value !== null && 'column' in value
        ? lineSeriesSchema
        : bandSeriesSchema;
    const result = schema.safeParse(value);
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

const timeSeriesSectionSchemaBase = z.strictObject({
  id: sectionIdSchema,
  title: z.string().min(1),
  source: sourceSchema,
  kind: z.literal(SectionKind.TIME_SERIES),
  width: sectionWidthSchema.optional(),
  ...sectionGateFields,
  controls: sectionControlsSchema,
  grain: z
    .enum([
      SectionGrain.MONTH,
      SectionGrain.WEEK,
      SectionGrain.DAY,
      SectionGrain.HOUR,
    ])
    .optional(),
  window: z.number().int().min(1).optional(),
  variant: z.enum(['line', 'area']).default('line'),
  stacked: z.boolean().default(false),
  format: valueFormatSchema,
  unit: z.string().min(1).optional(),
  series: z.array(timeSeriesSeriesSchema).min(1).max(12).optional(),
  pivot: z
    .strictObject({
      column: identifierSchema,
      value: valueBindingSchema,
      topN: pivotTopNSchema.optional(),
      interpolation: interpolationSchema.optional(),
      ...derivedSeriesFields,
    })
    .optional(),
  thresholds: z
    .array(
      z.strictObject({
        value: z.number().finite(),
        label: z.string().min(1).optional(),
      })
    )
    .min(1)
    .optional(),
  bands: z
    .array(
      z
        .strictObject({ from: z.number().finite(), to: z.number().finite() })
        .refine((band) => band.from <= band.to, {
          message: 'from must not exceed to',
          path: ['from'],
        })
    )
    .min(1)
    .optional(),
});

export const timeSeriesSectionSchema =
  timeSeriesSectionSchemaBase satisfies z.ZodType<
    TimeSeriesSection,
    z.ZodTypeDef,
    z.input<typeof timeSeriesSectionSchemaBase>
  >;
