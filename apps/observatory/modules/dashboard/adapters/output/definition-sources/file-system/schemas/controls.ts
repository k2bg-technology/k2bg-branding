import { z } from 'zod';

import type {
  ControlDefinition,
  DistinctControlDefinition,
  FixedListControlDefinition,
} from '../../../../../domain';
import { orderSchema } from './bars';
import { identifierSchema, sectionIdSchema, sourceSchema } from './statTiles';
import { valueBindingSchema } from './timeSeries';

const controlFields = {
  id: sectionIdSchema,
  label: z.string().min(1),
  column: identifierSchema,
  allLabel: z.string().min(1).optional(),
};
const fixedListControlSchema = z.strictObject({
  ...controlFields,
  options: z.array(z.string().regex(/\S/, 'must not be blank')).min(1),
}) satisfies z.ZodType<FixedListControlDefinition>;
const distinctControlSchemaBase = z.strictObject({
  ...controlFields,
  options: z.literal('distinct'),
  source: sourceSchema.optional(),
  order: orderSchema,
  value: valueBindingSchema.optional(),
});
const distinctControlSchema = distinctControlSchemaBase satisfies z.ZodType<
  DistinctControlDefinition,
  z.ZodTypeDef,
  z.input<typeof distinctControlSchemaBase>
>;

const controlSchemaBase = z
  .unknown()
  .transform((value, context): ControlDefinition => {
    const schema = z
      .object({ options: z.literal('distinct') })
      .passthrough()
      .safeParse(value).success
      ? distinctControlSchema
      : fixedListControlSchema;
    const result = schema.safeParse(value);
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
export const controlSchema = controlSchemaBase satisfies z.ZodType<
  ControlDefinition,
  z.ZodTypeDef,
  z.input<typeof controlSchemaBase>
>;
