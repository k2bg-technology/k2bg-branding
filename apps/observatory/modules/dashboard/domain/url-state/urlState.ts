import type { ControlSelections } from '../controls';
import { type DashboardDefinition, SectionKind } from '../definition';
import { Period } from '../period';

export type SearchParameters = Record<string, string | string[] | undefined>;

export interface UrlState {
  period: Period | null;
  controls: ControlSelections;
  pages: Record<string, number>;
  foreign: { key: string; value: string }[];
}

export type ParsedUrlState =
  | { valid: true; state: UrlState }
  | { valid: false; problem: string; key: string };

const PAGE_PATTERN = /^[1-9][0-9]*$/;

function addParameter(
  result: ParsedUrlState,
  key: string,
  value: string | string[] | undefined,
  dashboard: DashboardDefinition
): ParsedUrlState {
  if (!result.valid || value === undefined) {
    return result;
  }
  if (Array.isArray(value)) {
    return { valid: false, problem: 'repeated-key', key };
  }
  if (key === 'period') {
    const period = Period.parse(dashboard.grain, value);
    return period === null
      ? { valid: false, problem: 'invalid-period', key }
      : { valid: true, state: { ...result.state, period } };
  }
  if (key.startsWith('control.')) {
    const controlId = key.slice('control.'.length);
    const control = dashboard.controls?.find(
      (candidate) => candidate.id === controlId
    );
    if (control === undefined) {
      return { valid: false, problem: 'unknown-control', key };
    }
    if (value === '') {
      return result;
    }
    if (!control.options.includes(value)) {
      return { valid: false, problem: 'invalid-control', key };
    }
    return {
      valid: true,
      state: {
        ...result.state,
        controls: { ...result.state.controls, [controlId]: value },
      },
    };
  }
  if (key.startsWith('page.')) {
    const sectionId = key.slice('page.'.length);
    const section = dashboard.sections.find(
      (candidate) => candidate.id === sectionId
    );
    if (section === undefined) {
      return { valid: false, problem: 'unknown-section', key };
    }
    if (section.kind !== SectionKind.TABLE || section.paging === undefined) {
      return { valid: false, problem: 'unpaged-section', key };
    }
    const page = Number(value);
    if (!PAGE_PATTERN.test(value) || !Number.isSafeInteger(page)) {
      return { valid: false, problem: 'invalid-page', key };
    }
    return {
      valid: true,
      state: {
        ...result.state,
        pages: { ...result.state.pages, [sectionId]: page },
      },
    };
  }
  return {
    valid: true,
    state: {
      ...result.state,
      foreign: result.state.foreign.concat({ key, value }),
    },
  };
}

export function parseUrlState(
  searchParameters: SearchParameters,
  dashboard: DashboardDefinition
): ParsedUrlState {
  const initial: ParsedUrlState = {
    valid: true,
    state: { period: null, controls: {}, pages: {}, foreign: [] },
  };
  return Object.entries(searchParameters).reduce<ParsedUrlState>(
    (result, [key, value]) => addParameter(result, key, value, dashboard),
    initial
  );
}

export function withPeriod(state: UrlState, period: Period): UrlState {
  return { ...state, period, pages: {} };
}

export function withPage(
  state: UrlState,
  sectionId: string,
  page: number
): UrlState {
  return { ...state, pages: { ...state.pages, [sectionId]: page } };
}

export function serializeUrlState(state: UrlState): string {
  const periodPairs: [string, string][] =
    state.period === null ? [] : [['period', state.period.toString()]];
  const controlPairs: [string, string][] = Object.keys(state.controls)
    .sort()
    .map((id) => [`control.${id}`, state.controls[id]]);
  const pagePairs: [string, string][] = Object.keys(state.pages)
    .sort()
    .filter((sectionId) => state.pages[sectionId] !== 1)
    .map((sectionId) => [`page.${sectionId}`, String(state.pages[sectionId])]);
  const foreignPairs: [string, string][] = state.foreign.map(
    ({ key, value }) => [key, value]
  );
  return periodPairs
    .concat(controlPairs, pagePairs, foreignPairs)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join('&');
}
