import { describe, expect, it } from 'vitest';

import type { DashboardDefinition } from '../definition';
import { Period } from '../period';
import {
  parseUrlState,
  serializeUrlState,
  withPage,
  withPeriod,
} from './urlState';

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
    {
      id: 'topn',
      title: 'Top N',
      kind: 'table',
      source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
      columns: [
        {
          header: 'Value',
          column: 'value',
          type: 'number',
          format: { type: 'number' },
        },
      ],
      limit: 10,
    },
    {
      id: 'detail',
      title: 'Detail',
      kind: 'table',
      source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
      columns: [
        {
          header: 'Value',
          column: 'value',
          type: 'number',
          format: { type: 'number' },
        },
      ],
      paging: { pageSize: 20 },
    },
    {
      id: 'other',
      title: 'Other',
      kind: 'table',
      source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
      columns: [
        {
          header: 'Value',
          column: 'value',
          type: 'number',
          format: { type: 'number' },
        },
      ],
      paging: { pageSize: 20 },
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
      parameters: { 'page.detail': '0' },
      problem: 'invalid-page',
      key: 'page.detail',
    },
    {
      parameters: { 'page.detail': 'abc' },
      problem: 'invalid-page',
      key: 'page.detail',
    },
    {
      parameters: { 'page.detail': '1e3' },
      problem: 'invalid-page',
      key: 'page.detail',
    },
    {
      parameters: { 'page.detail': '1.0' },
      problem: 'invalid-page',
      key: 'page.detail',
    },
    {
      parameters: { 'page.headline': '2' },
      problem: 'unpaged-section',
      key: 'page.headline',
    },
    {
      parameters: { 'page.topn': '2' },
      problem: 'unpaged-section',
      key: 'page.topn',
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
    const result = parseUrlState(
      { period: '2026-08', 'page.other': '2', 'page.detail': '3' },
      dashboard
    );

    expect(result.valid && result.state.period?.toString()).toBe('2026-08');
    expect(result.valid && result.state.pages).toEqual({
      other: 2,
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
        'period=2026-08&page.detail=2&note%26period=kept%3Dvalue'
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

describe('URL page transition', () => {
  it('omits page one and serializes later pages', () => {
    const parsed = parseUrlState({ period: '2026-08' }, dashboard);
    if (!parsed.valid) {
      throw new Error('Expected URL fixture to parse');
    }
    expect(serializeUrlState(withPage(parsed.state, 'detail', 1))).toBe(
      'period=2026-08'
    );
    expect(serializeUrlState(withPage(parsed.state, 'detail', 2))).toBe(
      'period=2026-08&page.detail=2'
    );
  });
});
