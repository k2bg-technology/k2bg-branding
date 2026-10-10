import { z } from 'zod';

import {
  Reduction,
  SectionGrain,
  SectionKind,
  type TimeSeriesSection,
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
  series: z.array(seriesSchema).min(1).max(12),
});

export const timeSeriesSectionSchema =
  timeSeriesSectionSchemaBase satisfies z.ZodType<
    TimeSeriesSection,
    z.ZodTypeDef,
    z.input<typeof timeSeriesSectionSchemaBase>
  >;
