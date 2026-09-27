import {
  type DashboardDefinition,
  type DefinitionViolation,
  Reduction,
  SectionKind,
} from './types';

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

  return definition.sections.flatMap((section, sectionIndex) => {
    if (section.kind === SectionKind.TIME_SERIES) {
      return section.format.type === 'currency'
        ? [
            {
              path: ['sections', sectionIndex, 'format'],
              message: 'A currency section requires dashboard currency',
            },
          ]
        : [];
    }
    return section.tiles.flatMap((tile, tileIndex) =>
      tile.format.type === 'currency'
        ? [
            {
              path: ['sections', sectionIndex, 'tiles', tileIndex, 'format'],
              message: 'A currency tile requires dashboard currency',
            },
          ]
        : []
    );
  });
}

function stackingViolations(
  definition: DashboardDefinition
): DefinitionViolation[] {
  return definition.sections.flatMap((section, sectionIndex) => {
    if (section.kind !== SectionKind.TIME_SERIES || !section.stacked) {
      return [];
    }
    return [
      ...(section.variant === 'line'
        ? [
            {
              path: ['sections', sectionIndex, 'stacked'],
              message: 'Stacking requires the area variant',
            },
          ]
        : []),
      ...section.series.flatMap((series, seriesIndex) =>
        series.reduction === Reduction.SUM
          ? []
          : [
              {
                path: [
                  'sections',
                  sectionIndex,
                  'series',
                  seriesIndex,
                  'reduction',
                ],
                message:
                  'Stacking adds values up and requires the sum reduction',
              },
            ]
      ),
    ];
  });
}

export function validateDefinitionRules(
  definition: DashboardDefinition
): DefinitionViolation[] {
  return duplicateSectionViolations(definition).concat(
    currencyViolations(definition),
    stackingViolations(definition)
  );
}
