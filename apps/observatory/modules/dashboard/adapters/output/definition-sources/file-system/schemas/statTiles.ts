import { z } from 'zod';

import {
  PercentInputScale,
  Reduction,
  SectionKind,
  SectionWidth,
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
]) satisfies z.ZodType<TimeBinding>;

const sourceSchema = z.strictObject({
  dataset: identifierSchema,
  view: identifierSchema,
  time: timeBindingSchema,
});

const valueFormatSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('number') }),
  z.strictObject({ type: z.literal('currency') }),
  z.strictObject({
    type: z.literal('percent'),
    inputScale: z.enum([PercentInputScale.RATIO, PercentInputScale.PERCENT]),
  }),
]) satisfies z.ZodType<ValueFormat>;

const tileSchemaBase = z.strictObject({
  label: z.string().min(1),
  column: identifierSchema,
  reduction: z
    .enum([
      Reduction.SUM,
      Reduction.AVERAGE,
      Reduction.MINIMUM,
      Reduction.MAXIMUM,
      Reduction.LATEST,
    ])
    .default(Reduction.SUM),
  format: valueFormatSchema,
  unit: z.string().min(1).optional(),
});
const tileSchema = tileSchemaBase satisfies z.ZodType<
  StatTileDefinition,
  z.ZodTypeDef,
  z.input<typeof tileSchemaBase>
>;

const statTilesSectionSchemaBase = z.strictObject({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/),
  title: z.string().min(1),
  source: sourceSchema,
  kind: z.literal(SectionKind.STAT_TILES),
  width: z
    .enum([SectionWidth.FULL, SectionWidth.HALF, SectionWidth.THIRD])
    .optional(),
  tiles: z.array(tileSchema).min(1),
});
export const statTilesSectionSchema =
  statTilesSectionSchemaBase satisfies z.ZodType<
    StatTilesSection,
    z.ZodTypeDef,
    z.input<typeof statTilesSectionSchemaBase>
  >;
