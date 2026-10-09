import { z } from 'zod';

import {
  type BarsSection,
  type CategoryOrder,
  SectionKind,
} from '../../../../../domain';
import {
  identifierSchema,
  sectionIdSchema,
  sectionWidthSchema,
  sourceSchema,
  valueFormatSchema,
} from './statTiles';
import { seriesSchema } from './timeSeries';

const valueBindingSchema = seriesSchema.omit({ label: true });
const pivotTopNSchema = z.strictObject({
  count: z.number().int().min(1).max(11),
  otherLabel: z.string().min(1),
});
const axisTopNSchema = z.strictObject({
  count: z.number().int().min(1).max(100),
  otherLabel: z.string().min(1),
});
const sortKeyOrderSchema = z.strictObject({
  sortKey: z.strictObject({
    column: identifierSchema,
    type: z.enum(['text', 'number']),
  }),
});
const orderSchema = z
  .unknown()
  .transform((value, context): CategoryOrder | typeof z.NEVER => {
    if (value === 'value-desc') return value;
    if (typeof value === 'string' || value === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid category order',
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
const axisSchema = z.discriminatedUnion('axis', [
  z.strictObject({ axis: z.literal('time'), window: z.number().int().min(1) }),
  z.strictObject({
    axis: z.literal('category'),
    column: identifierSchema,
    by: identifierSchema.optional(),
    topN: axisTopNSchema.optional(),
    order: orderSchema,
  }),
]);

const barsSectionSchemaBase = z.strictObject({
  id: sectionIdSchema,
  title: z.string().min(1),
  source: sourceSchema,
  kind: z.literal(SectionKind.BARS),
  width: sectionWidthSchema.optional(),
  x: axisSchema,
  series: z.array(seriesSchema).min(1).max(12).optional(),
  pivot: z
    .strictObject({
      column: identifierSchema,
      value: valueBindingSchema,
      topN: pivotTopNSchema,
    })
    .optional(),
  stacked: z.boolean().default(false),
  format: valueFormatSchema,
  unit: z.string().min(1).optional(),
});

export const barsSectionSchema = barsSectionSchemaBase satisfies z.ZodType<
  BarsSection,
  z.ZodTypeDef,
  z.input<typeof barsSectionSchemaBase>
>;
