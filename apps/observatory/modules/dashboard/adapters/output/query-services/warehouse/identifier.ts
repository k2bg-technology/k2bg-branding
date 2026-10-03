import { RepositoryError, WAREHOUSE_IDENTIFIER_PATTERN } from '../../../shared';

export function quoteIdentifier(identifier: string): string {
  if (!WAREHOUSE_IDENTIFIER_PATTERN.test(identifier)) {
    throw new RepositoryError(
      `Invalid warehouse identifier: ${JSON.stringify(identifier)}`
    );
  }
  return `\`${identifier}\``;
}

export function qualifiedView(dataset: string, view: string): string {
  quoteIdentifier(dataset);
  quoteIdentifier(view);
  return `\`${dataset}.${view}\``;
}
