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
    switch (section.kind) {
      case SectionKind.TIME_SERIES:
      case SectionKind.BARS:
        return section.format.type === 'currency'
          ? [
              {
                path: ['sections', sectionIndex, 'format'],
                message: 'A currency section requires dashboard currency',
              },
            ]
          : [];
      case SectionKind.TABLE:
        return section.columns.flatMap((column, columnIndex) =>
          column.type === 'number' && column.format.type === 'currency'
            ? [
                {
                  path: [
                    'sections',
                    sectionIndex,
                    'columns',
                    columnIndex,
                    'format',
                  ],
                  message: 'A currency column requires dashboard currency',
                },
              ]
            : []
        );
      case SectionKind.STAT_TILES:
        return section.tiles.flatMap((tile, tileIndex) =>
          tile.format.type === 'currency'
            ? [
                {
                  path: [
                    'sections',
                    sectionIndex,
                    'tiles',
                    tileIndex,
                    'format',
                  ],
                  message: 'A currency tile requires dashboard currency',
                },
              ]
            : []
        );
      default:
        throw new Error(`Unsupported section kind: ${JSON.stringify(section)}`);
    }
  });
}

function barsSeriesSourceViolations(definition: DashboardDefinition) {
  return definition.sections.flatMap((section, index) =>
    section.kind === SectionKind.BARS &&
    (section.series === undefined) === (section.pivot === undefined)
      ? [
          {
            path: ['sections', index, 'series'],
            message: 'A bars section declares exactly one of series and pivot',
          },
        ]
      : []
  );
}

function barsRankingViolations(definition: DashboardDefinition) {
  return definition.sections.flatMap((section, index) => {
    if (
      section.kind !== SectionKind.BARS ||
      section.x.axis !== 'category' ||
      section.series === undefined
    ) {
      return [];
    }
    const { by, order, topN } = section.x;
    if (by === undefined) {
      return section.series.length > 1 &&
        (topN !== undefined || order === 'value-desc')
        ? [
            {
              path: ['sections', index, 'x', 'by'],
              message: 'Ranking several series requires by',
            },
          ]
        : [];
    }
    const matches = section.series.filter((series) => series.column === by);
    if (matches.length === 1) {
      return [];
    }
    return [
      {
        path: ['sections', index, 'x', 'by'],
        message:
          matches.length === 0
            ? `Ranking column "${by}" is not a declared series`
            : `Ranking column "${by}" matches several declared series`,
      },
    ];
  });
}

function barsPivotAxisViolations(definition: DashboardDefinition) {
  return definition.sections.flatMap((section, index) =>
    section.kind === SectionKind.BARS &&
    section.pivot !== undefined &&
    section.x.axis !== 'time'
      ? [
          {
            path: ['sections', index, 'pivot'],
            message:
              'pivot splits time buckets by a category column and requires the time axis',
          },
        ]
      : []
  );
}

function barsSumViolations(definition: DashboardDefinition) {
  return definition.sections.flatMap((section, sectionIndex) => {
    if (section.kind !== SectionKind.BARS) {
      return [];
    }
    const bindings =
      section.pivot === undefined
        ? (section.series ?? []).map((binding, index) => ({
            binding,
            path: ['sections', sectionIndex, 'series', index, 'reduction'] as (
              | string
              | number
            )[],
          }))
        : [
            {
              binding: section.pivot.value,
              path: [
                'sections',
                sectionIndex,
                'pivot',
                'value',
                'reduction',
              ] as (string | number)[],
            },
          ];
    const stacking = section.stacked
      ? bindings
          .filter(({ binding }) => binding.reduction !== Reduction.SUM)
          .map(({ path }) => ({
            path,
            message: 'Stacking adds values up and requires the sum reduction',
          }))
      : [];
    const hasRemainder =
      section.pivot !== undefined ||
      (section.x.axis === 'category' && section.x.topN !== undefined);
    const remainder = hasRemainder
      ? bindings
          .filter(({ binding }) => binding.reduction !== Reduction.SUM)
          .map(({ path }) => ({
            path,
            message:
              'A remainder adds values up and requires the sum reduction',
          }))
      : [];
    if (
      section.x.axis !== 'category' ||
      section.x.order !== 'value-desc' ||
      section.series === undefined
    ) {
      return [...stacking, ...remainder];
    }
    const matches = section.series
      .map((series, index) => ({ series, index }))
      .filter(
        ({ series }) =>
          series.column ===
          (section.x.axis === 'category' ? section.x.by : undefined)
      );
    const soleSeriesIndex =
      section.x.by === undefined && section.series.length === 1 ? 0 : -1;
    const rankingIndex =
      matches.length === 1 ? matches[0].index : soleSeriesIndex;
    const ranking =
      rankingIndex >= 0 &&
      section.series[rankingIndex].reduction !== Reduction.SUM
        ? [
            {
              path: [
                'sections',
                sectionIndex,
                'series',
                rankingIndex,
                'reduction',
              ],
              message:
                'Ranking by value adds values up and requires the sum reduction',
            },
          ]
        : [];
    return [...stacking, ...remainder, ...ranking];
  });
}

function tableRowBoundViolations(
  definition: DashboardDefinition
): DefinitionViolation[] {
  return definition.sections.flatMap((section, index) =>
    section.kind === SectionKind.TABLE &&
    (section.limit === undefined) === (section.paging === undefined)
      ? [
          {
            path: ['sections', index, 'limit'],
            message: 'A table declares exactly one of limit and paging',
          },
        ]
      : []
  );
}

function tableSortViolations(
  definition: DashboardDefinition
): DefinitionViolation[] {
  return definition.sections.flatMap((section, index) => {
    if (section.kind !== SectionKind.TABLE || section.sort === undefined) {
      return [];
    }
    const matches = section.columns.filter(
      (column) => column.column === section.sort?.column
    );
    if (matches.length === 1) {
      return [];
    }
    return [
      {
        path: ['sections', index, 'sort', 'column'],
        message:
          matches.length === 0
            ? `Sort column "${section.sort.column}" is not a declared column`
            : `Sort column "${section.sort.column}" matches several declared columns`,
      },
    ];
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
    sectionGrainViolations(definition),
    tableRowBoundViolations(definition),
    tableSortViolations(definition),
    barsSeriesSourceViolations(definition),
    barsRankingViolations(definition),
    barsPivotAxisViolations(definition),
    barsSumViolations(definition)
  );
}
