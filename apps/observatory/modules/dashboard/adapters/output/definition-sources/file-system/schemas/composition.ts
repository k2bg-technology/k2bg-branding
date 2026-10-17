import { z } from 'zod';

import {
  type DonutSection,
  SectionKind,
  type TreemapSection,
} from '../../../../../domain';
import { axisTopNSchema, orderSchema } from './bars';
import {
  identifierSchema,
  sectionControlsSchema,
  sectionIdSchema,
  sectionWidthSchema,
  sourceSchema,
  valueFormatSchema,
} from './statTiles';
import { seriesSchema } from './timeSeries';

const compositionFields = {
  id: sectionIdSchema,
  title: z.string().min(1),
  source: sourceSchema,
  width: sectionWidthSchema.optional(),
  controls: sectionControlsSchema,
  category: identifierSchema,
  categoryLabel: z.string().min(1),
  value: seriesSchema,
  topN: axisTopNSchema.optional(),
  format: valueFormatSchema,
  unit: z.string().min(1).optional(),
};

const donutSectionSchemaBase = z.strictObject({
  ...compositionFields,
  kind: z.literal(SectionKind.DONUT),
  order: orderSchema,
  centerColumn: identifierSchema.optional(),
  centerLabel: z.string().min(1).optional(),
});
export const donutSectionSchema = donutSectionSchemaBase satisfies z.ZodType<
  DonutSection,
  z.input<typeof donutSectionSchemaBase>
>;

const treemapSectionSchemaBase = z.strictObject({
  ...compositionFields,
  kind: z.literal(SectionKind.TREEMAP),
  group: identifierSchema.optional(),
  groupLabel: z.string().min(1).optional(),
});
export const treemapSectionSchema =
  treemapSectionSchemaBase satisfies z.ZodType<
    TreemapSection,
    z.input<typeof treemapSectionSchemaBase>
  >;
