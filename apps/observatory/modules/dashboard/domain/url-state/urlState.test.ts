import { describe, expect, it } from 'vitest';

import type { DashboardDefinition } from '../definition';
import { Period } from '../period';
import { parseUrlState, serializeUrlState, withPeriod } from './urlState';

const dashboard: DashboardDefinition = {
  id: 'summary',
  title: 'Summary',
  grain: 'month',
  timeZone: 'UTC',
  locale: 'en-US',
  revalidate: 86_400,
  defaultPeriod: 'latest-with-data',
  sections: [
    {
      id: 'headline',
      title: 'Headline',
      kind: 'stat-tiles',
      source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
      tiles: [
        {
          label: 'Total',
          column: 'total',
          reduction: 'sum',
          format: { type: 'number' },
        },
      ],
    },
  ],
};

describe('parseUrlState', () => {
  it.each([
    {
      parameters: { period: '2026-13' },
      problem: 'invalid-period',
      key: 'period',
    },
    {
      parameters: { period: '2026-8' },
      problem: 'invalid-period',
      key: 'period',
    },
    {
      parameters: { 'control.any': 'x' },
      problem: 'unknown-control',
      key: 'control.any',
    },
    {
      parameters: { 'page.unknown': '2' },
      problem: 'unknown-section',
      key: 'page.unknown',
    },
    {
      parameters: { 'page.headline': '0' },
      problem: 'invalid-page',
      key: 'page.headline',
    },
    {
      parameters: { 'page.headline': 'abc' },
      problem: 'invalid-page',
      key: 'page.headline',
    },
    {
      parameters: { 'page.headline': '1e3' },
      problem: 'invalid-page',
      key: 'page.headline',
    },
    {
      parameters: { 'page.headline': '1.0' },
      problem: 'invalid-page',
      key: 'page.headline',
    },
    {
      parameters: { 'control.any': 'x', period: '2026-08' },
      problem: 'unknown-control',
      key: 'control.any',
    },
    {
      parameters: { period: ['2026-08', '2026-09'] },
      problem: 'repeated-key',
      key: 'period',
    },
  ])('rejects $problem for $key', ({ parameters, problem, key }) => {
    const result = parseUrlState(parameters, dashboard);

    expect(result).toEqual({ valid: false, problem, key });
  });

  it('reads a valid period and every section page into the state', () => {
    const twoSections = {
      ...dashboard,
      sections: [
        dashboard.sections[0],
        { ...dashboard.sections[0], id: 'detail' },
      ],
    };

    const result = parseUrlState(
      { period: '2026-08', 'page.headline': '2', 'page.detail': '3' },
      twoSections
    );

    expect(result.valid && result.state.period?.toString()).toBe('2026-08');
    expect(result.valid && result.state.pages).toEqual({
      headline: 2,
      detail: 3,
    });
  });

  it.each([
    { grain: 'week', period: '2026-W35' },
    { grain: 'day', period: '2026-09-03' },
  ] as const)('reads a $grain period $period', ({ grain, period }) => {
    const result = parseUrlState({ period }, { ...dashboard, grain });

    expect(result.valid && result.state.period?.toString()).toBe(period);
  });

  it.each([
    { grain: 'week', period: '2026-09' },
    { grain: 'day', period: '2026-W35' },
    { grain: 'day', period: '2026-09' },
  ] as const)(
    'rejects period $period on a $grain dashboard',
    ({ grain, period }) => {
      const result = parseUrlState({ period }, { ...dashboard, grain });

      expect(result).toEqual({
        valid: false,
        problem: 'invalid-period',
        key: 'period',
      });
    }
  );
});

describe('URL period transition', () => {
  it('drops section pages while keeping foreign keys and encoding their delimiters', () => {
    const parameters = Object.fromEntries(
      new URLSearchParams(
        'period=2026-08&page.headline=2&note%26period=kept%3Dvalue'
      )
    );
    const parsed = parseUrlState(parameters, dashboard);
    const next = Period.parse('month', '2026-09');
    if (!parsed.valid || next === null) {
      throw new Error('Expected URL fixtures to parse');
    }

    const query = serializeUrlState(withPeriod(parsed.state, next));
    const reparsed = parseUrlState(
      Object.fromEntries(new URLSearchParams(query)),
      dashboard
    );

    expect(query).toBe('period=2026-09&note%26period=kept%3Dvalue');
    expect(reparsed.valid && reparsed.state.foreign).toEqual([
      { key: 'note&period', value: 'kept=value' },
    ]);
    expect(new URLSearchParams(query).getAll('period')).toEqual(['2026-09']);
  });
});
