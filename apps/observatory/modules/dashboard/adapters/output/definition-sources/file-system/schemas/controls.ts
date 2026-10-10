import { z } from 'zod';

import type { ControlDefinition } from '../../../../../domain';
import { identifierSchema, sectionIdSchema } from './statTiles';

export const controlSchema = z.strictObject({
  id: sectionIdSchema,
  label: z.string().min(1),
  column: identifierSchema,
  options: z.array(z.string().regex(/\S/, 'must not be blank')).min(1),
  allLabel: z.string().min(1).optional(),
}) satisfies z.ZodType<ControlDefinition>;
