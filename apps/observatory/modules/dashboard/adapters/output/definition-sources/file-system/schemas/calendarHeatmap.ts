import { z } from 'zod';

import {
  type CalendarHeatmapSection,
  Reduction,
  SectionKind,
} from '../../../../../domain';
import {
  identifierSchema,
  reductionSchema,
  sectionIdSchema,
  sectionWidthSchema,
  sourceSchema,
  transformSchema,
  valueFormatSchema,
} from './statTiles';

const calendarHeatmapSectionSchemaBase = z.strictObject({
  id: sectionIdSchema,
  title: z.string().min(1),
  source: sourceSchema,
  kind: z.literal(SectionKind.CALENDAR_HEATMAP),
  width: sectionWidthSchema.optional(),
  range: z.enum(['trailing', 'calendar-year']).default('trailing'),
  window: z.number().int().min(1).max(366).optional(),
  value: z.strictObject({
    column: identifierSchema,
    reduction: reductionSchema.default(Reduction.SUM),
    transform: transformSchema.optional(),
  }),
  format: valueFormatSchema,
  unit: z.string().min(1).optional(),
  maximum: z.number().finite().positive().optional(),
  scaleLabels: z
    .strictObject({ less: z.string().min(1), more: z.string().min(1) })
    .optional(),
});

export const calendarHeatmapSectionSchema =
  calendarHeatmapSectionSchemaBase satisfies z.ZodType<
    CalendarHeatmapSection,
    z.ZodTypeDef,
    z.input<typeof calendarHeatmapSectionSchemaBase>
  >;
