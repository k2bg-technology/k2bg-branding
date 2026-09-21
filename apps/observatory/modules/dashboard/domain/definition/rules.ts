import type { DashboardDefinition, DefinitionViolation } from './types';

function duplicateSectionViolations(
  definition: DashboardDefinition
): DefinitionViolation[] {
  return definition.sections.flatMap((section, index) => {
    const firstIndex = definition.sections.findIndex(
      (candidate) => candidate.id === section.id
    );
    return firstIndex === index
      ? []
      : [
          {
            path: ['sections', index, 'id'],
            message: `Duplicate section id "${section.id}"`,
          },
        ];
  });
}

function currencyViolations(
  definition: DashboardDefinition
): DefinitionViolation[] {
  if (definition.currency !== undefined) {
    return [];
  }

  return definition.sections.flatMap((section, sectionIndex) =>
    section.tiles.flatMap((tile, tileIndex) =>
      tile.format.type === 'currency'
        ? [
            {
              path: ['sections', sectionIndex, 'tiles', tileIndex, 'format'],
              message: 'A currency tile requires dashboard currency',
            },
          ]
        : []
    )
  );
}

export function validateDefinitionRules(
  definition: DashboardDefinition
): DefinitionViolation[] {
  return duplicateSectionViolations(definition).concat(
    currencyViolations(definition)
  );
}
