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
      parameters: { period: ['2026-08', '2026-09'] },
      problem: 'repeated-key',
      key: 'period',
    },
  ])('rejects $problem for $key', ({ parameters, problem, key }) => {
    const result = parseUrlState(parameters, dashboard);

    expect(result).toEqual({ valid: false, problem, key });
  });

  it('reads a valid period and section page into the state', () => {
    const result = parseUrlState(
      { period: '2026-08', 'page.headline': '2' },
      dashboard
    );

    expect(result.valid && result.state.period?.toString()).toBe('2026-08');
    expect(result.valid && result.state.pages).toEqual({ headline: 2 });
  });

  it('keeps foreign keys in their original order', () => {
    const result = parseUrlState(
      { first: 'one', period: '2026-08', second: 'two' },
      dashboard
    );

    expect(result.valid && result.state.foreign).toEqual([
      { key: 'first', value: 'one' },
      { key: 'second', value: 'two' },
    ]);
  });
});

describe('URL period transition', () => {
  it('drops section pages while keeping foreign keys and encoding their delimiters', () => {
    const parameters = Object.fromEntries(
      new URLSearchParams(
        'period=2026-08&page.headline=2&note%26period=kept%3Dvalue'
      )
    );
    const parsed = parseUrlState(parameters, dashboard);
    const next = Period.parse('2026-09');
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

  it('sorts page keys and omits the first page', () => {
    const parsed = parseUrlState(
      { 'page.headline': '1', note: 'kept' },
      dashboard
    );
    if (!parsed.valid) {
      throw new Error('Expected URL fixture to parse');
    }

    expect(serializeUrlState(parsed.state)).toBe('note=kept');
  });

  it('writes owned keys in a fixed order before foreign keys', () => {
    const period = Period.parse('2026-08');
    if (period === null) {
      throw new Error('Expected fixture period to parse');
    }
    const state = {
      period,
      controls: { zeta: 'last', alpha: 'first' },
      pages: { zeta: 2, alpha: 1 },
      foreign: [
        { key: 'second', value: 'two' },
        { key: 'first', value: 'one' },
      ],
    };

    expect(serializeUrlState(state)).toBe(
      'period=2026-08&control.alpha=first&control.zeta=last&page.zeta=2&second=two&first=one'
    );
  });
});
