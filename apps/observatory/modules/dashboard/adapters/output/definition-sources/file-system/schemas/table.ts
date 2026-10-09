import { z } from 'zod';

import {
  SectionKind,
  type TableColumnDefinition,
  type TableSection,
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

const columnBase = {
  header: z.string().min(1),
  column: identifierSchema,
  alignment: z.enum(['start', 'end']).optional(),
};

const columnSchemaBase = z.discriminatedUnion('type', [
  z.strictObject({
    ...columnBase,
    type: z.enum(['text', 'date', 'timestamp']),
  }),
  z.strictObject({
    ...columnBase,
    type: z.literal('number'),
    format: valueFormatSchema.default({ type: 'number' }),
    unit: z.string().min(1).optional(),
    transform: transformSchema.optional(),
  }),
]);
const columnSchema = columnSchemaBase satisfies z.ZodType<
  TableColumnDefinition,
  z.ZodTypeDef,
  z.input<typeof columnSchemaBase>
>;

const tableSectionSchemaBase = z.strictObject({
  id: sectionIdSchema,
  title: z.string().min(1),
  source: sourceSchema,
  kind: z.literal(SectionKind.TABLE),
  width: sectionWidthSchema.optional(),
  controls: sectionControlsSchema,
  columns: z.array(columnSchema).min(1),
  sort: z
    .strictObject({
      column: identifierSchema,
      direction: z.enum(['ascending', 'descending']),
    })
    .optional(),
  limit: z.number().int().min(1).max(100).optional(),
  paging: z
    .strictObject({ pageSize: z.number().int().min(1).max(100) })
    .optional(),
  emptyMessage: z.string().min(1).optional(),
});

export const tableSectionSchema = tableSectionSchemaBase satisfies z.ZodType<
  TableSection,
  z.ZodTypeDef,
  z.input<typeof tableSectionSchemaBase>
>;
