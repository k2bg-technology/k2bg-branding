import type { ControlDefinition } from '../definition';

export type ResolvedControlOptions =
  | { status: 'ready'; options: string[] }
  | { status: 'unavailable' };
export type ResolvedControlOptionsById = Record<string, ResolvedControlOptions>;

export function selectControlOptions(
  control: ControlDefinition,
  resolved: ResolvedControlOptionsById
): ResolvedControlOptions {
  if (control.options !== 'distinct') {
    return { status: 'ready', options: control.options };
  }
  const options = resolved[control.id];
  if (options === undefined) {
    throw new Error(`Options for control "${control.id}" were not resolved`);
  }
  return options;
}
