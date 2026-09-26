import type { Clock } from '../../../use-cases';

export const systemClock: Clock = { now: () => Date.now() };
