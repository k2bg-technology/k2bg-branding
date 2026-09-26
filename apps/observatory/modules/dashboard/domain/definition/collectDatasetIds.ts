import type { DashboardDefinition } from './types';

export function collectDatasetIds(
  definitions: DashboardDefinition[]
): string[] {
  const datasetIds = definitions.flatMap((definition) => [
    ...definition.sections.map((section) => section.source.dataset),
    ...(definition.periodSource === undefined
      ? []
      : [definition.periodSource.dataset]),
  ]);
  return Array.from(new Set(datasetIds)).sort();
}
