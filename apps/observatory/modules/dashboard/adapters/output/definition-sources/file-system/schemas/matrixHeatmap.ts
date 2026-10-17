import { z } from 'zod';

import {
  type MatrixAxis,
  type MatrixHeatmapSection,
  Reduction,
  SectionKind,
} from '../../../../../domain';
import {
  identifierSchema,
  sectionControlsSchema,
  sectionIdSchema,
  sectionWidthSchema,
  sourceSchema,
  transformSchema,
  valueFormatSchema,
} from './statTiles';

const matrixAxisSchema = z.discriminatedUnion('axis', [
  z.strictObject({ axis: z.literal('date') }),
  z.strictObject({ axis: z.literal('hour') }),
  z.strictObject({ axis: z.literal('category'), column: identifierSchema }),
]) satisfies z.ZodType<MatrixAxis>;

const matrixHeatmapSectionSchemaBase = z.strictObject({
  id: sectionIdSchema,
  title: z.string().min(1),
  source: sourceSchema,
  kind: z.literal(SectionKind.MATRIX_HEATMAP),
  width: sectionWidthSchema.optional(),
  controls: sectionControlsSchema,
  rows: matrixAxisSchema,
  columns: matrixAxisSchema,
  window: z.number().int().min(1).max(365).optional(),
  value: z.strictObject({
    column: identifierSchema,
    reduction: z
      .enum([
        Reduction.SUM,
        Reduction.AVERAGE,
        Reduction.MINIMUM,
        Reduction.MAXIMUM,
      ])
      .default(Reduction.SUM),
    transform: transformSchema.optional(),
  }),
  format: valueFormatSchema,
  unit: z.string().min(1).optional(),
  minimum: z.number().finite().optional(),
  maximum: z.number().finite().optional(),
  scaleLabels: z
    .strictObject({ less: z.string().min(1), more: z.string().min(1) })
    .optional(),
});

export const matrixHeatmapSectionSchema =
  matrixHeatmapSectionSchemaBase satisfies z.ZodType<
    MatrixHeatmapSection,
    z.input<typeof matrixHeatmapSectionSchemaBase>
  >;
