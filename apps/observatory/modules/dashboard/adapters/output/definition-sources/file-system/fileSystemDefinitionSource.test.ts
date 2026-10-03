import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { FileSystemDefinitionSource } from './fileSystemDefinitionSource';

function createSection(overrides: Record<string, unknown> = {}) {
  return {
    id: 'headline',
    title: 'Headline',
    kind: 'stat-tiles',
    source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
    tiles: [
      {
        label: 'Total',
        column: 'total',
        format: { type: 'number' },
      },
    ],
    ...overrides,
  };
}

function createTimeSeries(overrides: Record<string, unknown> = {}) {
  return {
    id: 'trend',
    title: 'Trend',
    kind: 'time-series',
    source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
    window: 12,
    format: { type: 'duration', inputUnit: 'seconds' },
    series: [{ label: 'Elapsed', column: 'elapsed' }],
    ...overrides,
  };
}

function createDefinition(overrides: Record<string, unknown> = {}) {
  return {
    id: 'summary',
    title: 'Summary',
    grain: 'month',
    timeZone: 'Asia/Tokyo',
    sections: [createSection()],
    ...overrides,
  };
}

async function withDefinitionDirectory(
  files: Record<string, unknown>,
  run: (directory: string) => Promise<void>
): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), 'observatory-definitions-'));
  try {
    await Promise.all(
      Object.entries(files).map(([fileName, definition]) =>
        writeFile(
          join(directory, fileName),
          typeof definition === 'string'
            ? definition
            : JSON.stringify(definition),
          'utf8'
        )
      )
    );
    await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

describe('FileSystemDefinitionSource', () => {
  it('loads a time series with defaults while keeping another definition available', async () => {
    await withDefinitionDirectory(
      {
        'series.json': createDefinition({
          id: 'series',
          sections: [createTimeSeries()],
        }),
        'tiles.json': createDefinition({ id: 'tiles' }),
      },
      async (directory) => {
        const sut = new FileSystemDefinitionSource(directory);

        const result = await sut.load();

        expect(result.issues).toEqual([]);
        expect(result.definitions).toHaveLength(2);
        expect(
          result.definitions.find((definition) => definition.id === 'series')
            ?.sections[0]
        ).toMatchObject({
          variant: 'line',
          stacked: false,
          series: [{ reduction: 'sum' }],
        });
      }
    );
  });

  it.each([
    {
      name: 'zero window',
      section: createTimeSeries({ window: 0 }),
      path: 'sections[0].window',
    },
    {
      name: 'empty series',
      section: createTimeSeries({ series: [] }),
      path: 'sections[0].series',
    },
    {
      name: 'thirteen series',
      section: createTimeSeries({
        series: Array.from({ length: 13 }, (_, index) => ({
          label: `Series ${index}`,
          column: 'value',
        })),
      }),
      path: 'sections[0].series',
    },
    {
      name: 'unknown field',
      section: createTimeSeries({ extra: true }),
      path: 'sections[0]',
    },
    {
      name: 'invalid duration unit',
      section: createTimeSeries({
        format: { type: 'duration', inputUnit: 'days' },
      }),
      path: 'sections[0].format.inputUnit',
    },
    {
      name: 'invalid series column',
      section: createTimeSeries({
        series: [{ label: 'Value', column: 'bad;drop' }],
      }),
      path: 'sections[0].series[0].column',
    },
  ])(
    'reports a time-series $name with file name and path',
    async ({ section, path }) => {
      await withDefinitionDirectory(
        {
          'invalid.json': createDefinition({ sections: [section] }),
          'valid.json': createDefinition({ id: 'valid' }),
        },
        async (directory) => {
          const sut = new FileSystemDefinitionSource(directory);

          const result = await sut.load();

          expect(result.definitions).toHaveLength(1);
          expect(result.issues).toContainEqual(
            expect.objectContaining({ fileName: 'invalid.json', path })
          );
        }
      );
    }
  );
  it('loads a valid definition while reporting a malformed JSON file', async () => {
    await withDefinitionDirectory(
      {
        'broken.json': '{ "id":',
        'valid.json': createDefinition(),
      },
      async (directory) => {
        const sut = new FileSystemDefinitionSource(directory);

        const result = await sut.load();

        expect(result.definitions).toHaveLength(1);
        expect(result.issues).toContainEqual(
          expect.objectContaining({ fileName: 'broken.json' })
        );
      }
    );
  });

  it('reports a missing definitions directory without throwing', async () => {
    const missingDirectory = await mkdtemp(
      join(tmpdir(), 'missing-observatory-definitions-')
    );
    await rm(missingDirectory, { recursive: true, force: true });
    const sut = new FileSystemDefinitionSource(missingDirectory);

    const result = await sut.load();

    expect(result.definitions).toEqual([]);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ fileName: missingDirectory, path: '' })
    );
  });

  it('loads valid definitions with schema defaults while reporting an invalid file', async () => {
    await withDefinitionDirectory(
      {
        'valid.json': createDefinition(),
        'invalid.json': createDefinition({
          id: 'invalid',
          sections: [createSection({ kind: 'unknown-section' })],
        }),
      },
      async (directory) => {
        const sut = new FileSystemDefinitionSource(directory);

        const result = await sut.load();

        expect(result.definitions).toHaveLength(1);
        expect(result.definitions[0]).toMatchObject({
          locale: 'en-US',
          defaultPeriod: 'latest-with-data',
          revalidate: 86_400,
          sections: [{ tiles: [{ reduction: 'sum' }] }],
        });
        expect(result.issues).toContainEqual(
          expect.objectContaining({
            fileName: 'invalid.json',
            path: 'sections[0].kind',
          })
        );
      }
    );
  });

  it.each(['higher-is-better', 'lower-is-better', 'neutral'])(
    'loads a %s comparison direction',
    async (direction) => {
      await withDefinitionDirectory(
        {
          'valid.json': createDefinition({
            sections: [
              createSection({
                tiles: [
                  {
                    label: 'Total',
                    column: 'total',
                    format: { type: 'number' },
                    comparison: { direction },
                  },
                ],
              }),
            ],
          }),
        },
        async (directory) => {
          const sut = new FileSystemDefinitionSource(directory);

          const result = await sut.load();

          expect(result.definitions[0]?.sections[0]).toMatchObject({
            tiles: [{ comparison: { direction } }],
          });
        }
      );
    }
  );

  it('keeps an explicit default period and label overrides', async () => {
    const labels = {
      period: 'Review month',
      previousPeriod: 'Earlier month',
      nextPeriod: 'Later month',
    };
    await withDefinitionDirectory(
      {
        'valid.json': createDefinition({
          defaultPeriod: 'last-complete',
          labels,
        }),
      },
      async (directory) => {
        const sut = new FileSystemDefinitionSource(directory);

        const result = await sut.load();

        expect(result.definitions[0]).toMatchObject({
          defaultPeriod: 'last-complete',
          labels,
        });
      }
    );
  });

  it('keeps a valid period source that differs from the section sources', async () => {
    const periodSource = {
      dataset: 'calendar',
      view: 'months',
      time: 'recorded_on',
    };
    await withDefinitionDirectory(
      { 'valid.json': createDefinition({ periodSource }) },
      async (directory) => {
        const sut = new FileSystemDefinitionSource(directory);

        const result = await sut.load();

        expect(result.definitions[0]?.periodSource).toEqual(periodSource);
      }
    );
  });

  it.each([
    {
      name: 'an injection-shaped identifier',
      definition: createDefinition({
        sections: [
          createSection({
            source: {
              dataset: 'metrics; DROP TABLE records',
              view: 'monthly',
              time: 'recorded_on',
            },
          }),
        ],
      }),
      path: 'sections[0].source.dataset',
    },
    {
      name: 'an unknown field',
      definition: createDefinition({ labels: { empty: 'Nothing here' } }),
      path: 'labels',
    },
    {
      name: 'an invalid locale',
      definition: createDefinition({ locale: 'not_a_locale' }),
      path: 'locale',
    },
    {
      name: 'an invalid time zone',
      definition: createDefinition({ timeZone: 'Asia/Invalid' }),
      path: 'timeZone',
    },
    {
      name: 'an invalid currency',
      definition: createDefinition({ currency: 'ZZZ' }),
      path: 'currency',
    },
    {
      name: 'an invalid reduction',
      definition: createDefinition({
        sections: [
          createSection({
            tiles: [
              {
                label: 'Total',
                column: 'total',
                reduction: 'median',
                format: { type: 'number' },
              },
            ],
          }),
        ],
      }),
      path: 'sections[0].tiles[0].reduction',
    },
    {
      name: 'a duration format',
      definition: createDefinition({
        sections: [
          createSection({
            tiles: [
              {
                label: 'Elapsed',
                column: 'elapsed',
                format: { type: 'duration' },
              },
            ],
          }),
        ],
      }),
      path: 'sections[0].tiles[0].format.inputUnit',
    },
  ])(
    'reports $name with its file name and JSON path',
    async ({ definition, path }) => {
      await withDefinitionDirectory(
        { 'invalid.json': definition },
        async (directory) => {
          const sut = new FileSystemDefinitionSource(directory);

          const result = await sut.load();

          expect(result.definitions).toHaveLength(0);
          expect(result.issues).toContainEqual(
            expect.objectContaining({ fileName: 'invalid.json', path })
          );
        }
      );
    }
  );

  it('reports duplicate section ids at the later id path', async () => {
    const section = createSection();
    await withDefinitionDirectory(
      {
        'duplicate-section.json': createDefinition({
          sections: [section, section],
        }),
      },
      async (directory) => {
        const sut = new FileSystemDefinitionSource(directory);

        const result = await sut.load();

        expect(result.issues).toContainEqual(
          expect.objectContaining({
            fileName: 'duplicate-section.json',
            path: 'sections[1].id',
          })
        );
      }
    );
  });

  it('reports duplicate dashboard ids on the later file while keeping the first', async () => {
    await withDefinitionDirectory(
      {
        'first.json': createDefinition({ title: 'First dashboard' }),
        'second.json': createDefinition({ title: 'Second dashboard' }),
      },
      async (directory) => {
        const sut = new FileSystemDefinitionSource(directory);

        const result = await sut.load();

        expect(result.definitions).toEqual([
          expect.objectContaining({ id: 'summary', title: 'First dashboard' }),
        ]);
        expect(result.issues).toContainEqual(
          expect.objectContaining({ fileName: 'second.json', path: 'id' })
        );
      }
    );
  });

  it('reports a currency tile without dashboard currency at the tile format path', async () => {
    await withDefinitionDirectory(
      {
        'currency.json': createDefinition({
          sections: [
            createSection({
              tiles: [
                {
                  label: 'Total',
                  column: 'total',
                  format: { type: 'currency' },
                },
              ],
            }),
          ],
        }),
      },
      async (directory) => {
        const sut = new FileSystemDefinitionSource(directory);

        const result = await sut.load();

        expect(result.issues).toContainEqual(
          expect.objectContaining({
            fileName: 'currency.json',
            path: 'sections[0].tiles[0].format',
          })
        );
      }
    );
  });

  it.each([
    {
      name: 'period source',
      definition: createDefinition({
        periodSource: {
          dataset: 'bad name',
          view: 'monthly',
          time: 'recorded_on',
        },
      }),
      path: 'periodSource.dataset',
    },
    {
      name: 'default period',
      definition: createDefinition({ defaultPeriod: 'next-month' }),
      path: 'defaultPeriod',
    },
    ...['period', 'previousPeriod', 'nextPeriod', 'truncated'].map((label) => ({
      name: `empty ${label} label`,
      definition: createDefinition({ labels: { [label]: '' } }),
      path: `labels.${label}`,
    })),
    {
      name: 'comparison field',
      definition: createDefinition({
        sections: [
          createSection({
            tiles: [
              {
                label: 'Total',
                column: 'total',
                format: { type: 'number' },
                comparison: { direction: 'neutral', baseline: 'year' },
              },
            ],
          }),
        ],
      }),
      path: 'sections[0].tiles[0].comparison',
    },
    {
      name: 'comparison direction',
      definition: createDefinition({
        sections: [
          createSection({
            tiles: [
              {
                label: 'Total',
                column: 'total',
                format: { type: 'number' },
                comparison: { direction: 'sideways' },
              },
            ],
          }),
        ],
      }),
      path: 'sections[0].tiles[0].comparison.direction',
    },
  ])(
    'reports an invalid $name with its file and JSON path',
    async ({ definition, path }) => {
      await withDefinitionDirectory(
        { 'invalid.json': definition },
        async (directory) => {
          const sut = new FileSystemDefinitionSource(directory);

          const result = await sut.load();

          expect(result.definitions).toHaveLength(0);
          expect(result.issues).toContainEqual(
            expect.objectContaining({ fileName: 'invalid.json', path })
          );
        }
      );
    }
  );

  it.each(['week', 'day'])('loads a %s-grain definition', async (grain) => {
    await withDefinitionDirectory(
      { 'valid.json': createDefinition({ grain }) },
      async (directory) => {
        const sut = new FileSystemDefinitionSource(directory);

        const result = await sut.load();

        expect(result.issues).toEqual([]);
        expect(result.definitions[0]?.grain).toBe(grain);
      }
    );
  });
});
