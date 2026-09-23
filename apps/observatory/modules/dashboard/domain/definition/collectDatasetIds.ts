import type { DashboardDefinition } from './types';

export function collectDatasetIds(
  definitions: DashboardDefinition[]
): string[] {
  const datasetIds = definitions.flatMap((definition) =>
    definition.sections.map((section) => section.source.dataset)
  );
  return Array.from(new Set(datasetIds)).sort();
}
