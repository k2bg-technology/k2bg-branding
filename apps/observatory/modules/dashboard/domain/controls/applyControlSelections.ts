import type {
  DashboardDefinition,
  Section,
  SourceDefinition,
  SourceFilter,
} from '../definition';

export type ControlSelections = Record<string, string>;

export function applyControlSelections(
  dashboard: DashboardDefinition,
  section: Section,
  selections: ControlSelections
): SourceDefinition {
  const appended = (section.controls ?? []).flatMap(
    (controlId): SourceFilter[] => {
      const value = selections[controlId];
      if (value === undefined) {
        return [];
      }
      const control = dashboard.controls?.find(
        (candidate) => candidate.id === controlId
      );
      if (control === undefined) {
        throw new Error(`Control "${controlId}" is not declared`);
      }
      return [{ column: control.column, operator: 'equals', value }];
    }
  );
  return appended.length === 0
    ? section.source
    : {
        ...section.source,
        filters: (section.source.filters ?? []).concat(appended),
      };
}
