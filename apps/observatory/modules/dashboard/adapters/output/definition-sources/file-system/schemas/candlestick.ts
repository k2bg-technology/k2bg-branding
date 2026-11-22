import { z } from 'zod';

import {
  type CandlestickSection,
  PeriodGrain,
  SectionKind,
} from '../../../../../domain';
import {
  identifierSchema,
  sectionControlsSchema,
  sectionGateFields,
  sectionIdSchema,
  sectionWidthSchema,
  sourceSchema,
  valueFormatSchema,
} from './statTiles';

const candleBindingSchema = z.strictObject({
  column: identifierSchema,
  label: z.string().min(1),
});

export const candlestickSectionSchema = z.strictObject({
  id: sectionIdSchema,
  title: z.string().min(1),
  kind: z.literal(SectionKind.CANDLESTICK),
  source: sourceSchema,
  width: sectionWidthSchema.optional(),
  controls: sectionControlsSchema,
  availability: sectionGateFields.availability,
  readiness: sectionGateFields.readiness,
  requiredControl: sectionIdSchema.optional(),
  grain: z
    .enum([PeriodGrain.MONTH, PeriodGrain.WEEK, PeriodGrain.DAY])
    .optional(),
  window: z.number().int().min(1).optional(),
  format: valueFormatSchema,
  unit: z.string().min(1).optional(),
  open: candleBindingSchema,
  high: candleBindingSchema,
  low: candleBindingSchema,
  close: candleBindingSchema,
  colors: z.enum(['green-up', 'red-up']).optional(),
}) satisfies z.ZodType<CandlestickSection>;
