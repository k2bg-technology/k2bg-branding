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

function sectionGrainViolations(
  definition: DashboardDefinition
): DefinitionViolation[] {
  const allowed = {
    month: ['month', 'day'],
    week: ['week', 'day'],
    day: ['day', 'hour'],
  } as const;
  return definition.sections.flatMap((section, sectionIndex) => {
    if (section.kind !== SectionKind.TIME_SERIES) {
      return [];
    }
    const grain = section.grain ?? definition.grain;
    if (!(allowed[definition.grain] as readonly string[]).includes(grain)) {
      return [
        {
          path: ['sections', sectionIndex, 'grain'],
          message: `Section grain "${grain}" is not supported by dashboard grain "${definition.grain}"`,
        },
      ];
    }
    return [
      ...(grain === definition.grain && section.window === undefined
        ? [
            {
              path: ['sections', sectionIndex, 'window'],
              message:
                'A time-series section at the dashboard grain requires window',
            },
          ]
        : []),
      ...(grain === 'hour' &&
      (typeof section.source.time === 'string' ||
        !('date' in section.source.time && 'hour' in section.source.time))
        ? [
            {
              path: ['sections', sectionIndex, 'source', 'time'],
              message:
                'An hour section requires source.time with date and hour columns',
            },
          ]
        : []),
    ];
  });
}

export function validateDefinitionRules(
  definition: DashboardDefinition
): DefinitionViolation[] {
  return duplicateSectionViolations(definition).concat(
    currencyViolations(definition),
    stackingViolations(definition),
    sectionGrainViolations(definition)
  );
}
