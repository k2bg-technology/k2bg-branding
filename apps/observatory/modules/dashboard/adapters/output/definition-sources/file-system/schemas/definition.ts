import { z } from 'zod';

import {
  type DashboardDefinition,
  type Section,
  SectionKind,
} from '../../../../../domain';
import { statTilesSectionSchema } from './statTiles';

function supportsLocale(locale: string): boolean {
  try {
    new Intl.NumberFormat(locale);
    return true;
  } catch {
    return false;
  }
}

function supportsTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

function supportsCurrency(currency: string): boolean {
  return (
    /^[A-Z]{3}$/.test(currency) &&
    Intl.supportedValuesOf('currency').includes(currency)
  );
}

const sectionSchemaBase = z.unknown().transform((value, context): Section => {
  const kindResult = z
    .object({ kind: z.string() })
    .passthrough()
    .safeParse(value);
  if (!kindResult.success) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['kind'],
      message: 'Section kind is required',
    });
    return z.NEVER;
  }

  switch (kindResult.data.kind) {
    case SectionKind.STAT_TILES: {
      const result = statTilesSectionSchema.safeParse(value);
      if (result.success) {
        return result.data;
      }
      result.error.issues.forEach((issue) => {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: issue.path,
          message: issue.message,
        });
      });
      return z.NEVER;
    }
    default:
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['kind'],
        message: `Unsupported section kind: ${JSON.stringify(kindResult.data.kind)}`,
      });
      return z.NEVER;
  }
});
const sectionSchema = sectionSchemaBase satisfies z.ZodType<
  Section,
  z.ZodTypeDef,
  z.input<typeof sectionSchemaBase>
>;

const dashboardDefinitionSchemaBase = z.strictObject({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  grain: z.literal('month'),
  timeZone: z.string().refine(supportsTimeZone, 'must be a valid time zone'),
  locale: z
    .string()
    .refine(supportsLocale, 'must be a valid BCP 47 locale')
    .default('en-US'),
  currency: z
    .string()
    .refine(supportsCurrency, 'must be an ISO 4217 currency code')
    .optional(),
  revalidate: z.number().int().positive().default(86_400),
  sections: z.array(sectionSchema).min(1),
});
export const dashboardDefinitionSchema =
  dashboardDefinitionSchemaBase satisfies z.ZodType<
    DashboardDefinition,
    z.ZodTypeDef,
    z.input<typeof dashboardDefinitionSchemaBase>
  >;
