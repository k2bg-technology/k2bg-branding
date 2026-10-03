export function clampUnit(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}
