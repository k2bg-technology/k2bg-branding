import { type ContentBundle, contentBundleSchema } from './schemas';

export type ContentBundleIssue = {
  item: string;
  field: string;
  message: string;
};

export type ContentBundleValidationResult =
  | { success: true; bundle: ContentBundle }
  | { success: false; issues: ContentBundleIssue[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateContentBundle(
  input: unknown
): ContentBundleValidationResult {
  const result = contentBundleSchema.safeParse(input);
  if (result.success) return { success: true, bundle: result.data };

  const issues = result.error.issues.flatMap((issue) => {
    const paths =
      issue.code === 'unrecognized_keys'
        ? issue.keys.map((key) => [...issue.path, key])
        : [issue.path];

    return paths.map((path): ContentBundleIssue => {
      const [collection, key, ...fields] = path;
      if (collection === 'authors' && typeof key === 'string') {
        return {
          item: `authors/${key}`,
          field: fields.join('.'),
          message: issue.message,
        };
      }
      if (
        typeof collection === 'string' &&
        ['posts', 'pages', 'media', 'affiliates'].includes(collection) &&
        typeof key === 'number'
      ) {
        const entries = isRecord(input) ? input[collection] : undefined;
        const entry: unknown = Array.isArray(entries)
          ? entries[key]
          : undefined;
        const id = isRecord(entry) ? entry.id : undefined;
        const item =
          typeof id === 'string' && id.length > 0
            ? `${collection}/${id}`
            : `${collection}[${key}]`;
        return { item, field: fields.join('.'), message: issue.message };
      }
      return { item: 'bundle', field: path.join('.'), message: issue.message };
    });
  });
  return { success: false, issues };
}
