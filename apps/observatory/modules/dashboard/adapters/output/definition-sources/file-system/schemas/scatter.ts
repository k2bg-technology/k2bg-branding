import { z } from 'zod';

import { type ScatterSection, SectionKind } from '../../../../../domain';
import {
  identifierSchema,
  sectionControlsSchema,
  sectionIdSchema,
  sectionWidthSchema,
  sourceSchema,
  valueFormatSchema,
} from './statTiles';

const axisSchema = z.strictObject({
  column: identifierSchema,
  label: z.string().min(1),
  format: valueFormatSchema,
  unit: z.string().min(1).optional(),
});

const scatterSectionSchemaBase = z.strictObject({
  id: sectionIdSchema,
  title: z.string().min(1),
  source: sourceSchema,
  kind: z.literal(SectionKind.SCATTER),
  width: sectionWidthSchema.optional(),
  controls: sectionControlsSchema,
  x: axisSchema,
  y: axisSchema,
  series: z
    .strictObject({ column: identifierSchema, label: z.string().min(1) })
    .optional(),
  trendLine: z
    .strictObject({ slope: identifierSchema, intercept: identifierSchema })
    .optional(),
  limit: z.number().int().min(1).max(1000),
});
export const scatterSectionSchema =
  scatterSectionSchemaBase satisfies z.ZodType<
    ScatterSection,
    z.ZodTypeDef,
    z.input<typeof scatterSectionSchemaBase>
  >;
