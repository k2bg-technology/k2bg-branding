import { z } from 'zod';

import {
  PercentInputScale,
  parseCalendarDate,
  Reduction,
  SectionKind,
  SectionWidth,
  type SourceDefinition,
  type SourceFilter,
  type StatTileDefinition,
  type StatTilesSection,
  type TimeBinding,
  type ValueFormat,
} from '../../../../../domain';
import { WAREHOUSE_IDENTIFIER_PATTERN } from '../../../../shared';

export const identifierSchema = z
  .string()
  .regex(
    WAREHOUSE_IDENTIFIER_PATTERN,
    'must be a warehouse identifier starting with a letter or underscore and containing only letters, digits, or underscores'
  );

const timeBindingSchema = z.union([
  identifierSchema,
  z.strictObject({
    column: identifierSchema,
    type: z.literal('timestamp'),
  }),
  z.strictObject({
    date: identifierSchema,
    hour: identifierSchema,
  }),
]) satisfies z.ZodType<TimeBinding>;

const filterValueSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
]);
const filterSchema = z.discriminatedUnion('operator', [
  z.strictObject({
    column: identifierSchema,
    operator: z.enum([
      'equals',
      'not-equals',
      'less-than',
      'less-than-or-equal',
      'greater-than',
      'greater-than-or-equal',
    ]),
    value: filterValueSchema,
  }),
  z.strictObject({
    column: identifierSchema,
    operator: z.enum(['in', 'not-in']),
    values: z
      .array(filterValueSchema)
      .min(1)
      .refine(
        (values) => values.every((value) => typeof value === typeof values[0]),
        'all values must have the same type'
      ),
  }),
  z.strictObject({
    column: identifierSchema,
    operator: z.enum(['is-null', 'is-not-null']),
  }),
]) satisfies z.ZodType<SourceFilter>;

export const sourceSchema = z.strictObject({
  dataset: identifierSchema,
  view: identifierSchema,
  time: timeBindingSchema,
  filters: z.array(filterSchema).min(1).optional(),
}) satisfies z.ZodType<SourceDefinition>;

export const valueFormatSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('number') }),
  z.strictObject({ type: z.literal('currency') }),
  z.strictObject({
    type: z.literal('percent'),
    inputScale: z.enum([PercentInputScale.RATIO, PercentInputScale.PERCENT]),
  }),
  z.strictObject({
    type: z.literal('duration'),
    inputUnit: z.enum(['seconds', 'minutes', 'hours']),
  }),
]) satisfies z.ZodType<ValueFormat>;

export const reductionSchema = z.enum([
  Reduction.SUM,
  Reduction.AVERAGE,
  Reduction.MINIMUM,
  Reduction.MAXIMUM,
  Reduction.LATEST,
]);
export const transformSchema = z.enum(['negate', 'absolute']);

export const sectionIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
export const sectionWidthSchema = z.enum([
  SectionWidth.FULL,
  SectionWidth.HALF,
  SectionWidth.THIRD,
]);
export const sectionControlsSchema = z.array(sectionIdSchema).min(1).optional();

export const sectionGateFields = {
  period: z.literal('latest').optional(),
  availability: z
    .strictObject({
      since: z
        .string()
        .refine(
          (value) => parseCalendarDate(value) !== null,
          'must be a calendar date (YYYY-MM-DD)'
        ),
      minimumBuckets: z.number().int().min(1).optional(),
      note: z.string().min(1).optional(),
    })
    .optional(),
  readiness: z
    .strictObject({
      column: identifierSchema,
      note: z.string().min(1).optional(),
    })
    .optional(),
};

const tileSchemaBase = z.strictObject({
  label: z.string().min(1),
  column: identifierSchema,
  reduction: reductionSchema.default(Reduction.SUM),
  transform: transformSchema.optional(),
  format: valueFormatSchema,
  unit: z.string().min(1).optional(),
  comparison: z
    .strictObject({
      direction: z.enum(['higher-is-better', 'lower-is-better', 'neutral']),
    })
    .optional(),
});
const tileSchema = tileSchemaBase satisfies z.ZodType<
  StatTileDefinition,
  z.ZodTypeDef,
  z.input<typeof tileSchemaBase>
>;

const statTilesSectionSchemaBase = z.strictObject({
  id: sectionIdSchema,
  title: z.string().min(1),
  source: sourceSchema,
  kind: z.literal(SectionKind.STAT_TILES),
  width: sectionWidthSchema.optional(),
  ...sectionGateFields,
  controls: sectionControlsSchema,
  tiles: z.array(tileSchema).min(1),
});
export const statTilesSectionSchema =
  statTilesSectionSchemaBase satisfies z.ZodType<
    StatTilesSection,
    z.ZodTypeDef,
    z.input<typeof statTilesSectionSchemaBase>
  >;
