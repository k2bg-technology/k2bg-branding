import { z } from 'zod';

import {
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

const lineSeriesSchema = seriesSchema.extend({
  interpolation: interpolationSchema.optional(),
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
