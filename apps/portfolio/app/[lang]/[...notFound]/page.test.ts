import { notFound } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

import NotFoundCatchAllPage from './page';

// The real `notFound()` throws to unwind rendering into the not-found
// boundary; the stub mirrors that so a fall-through would fail the test.
const { notFoundSignal } = vi.hoisted(() => ({
  notFoundSignal: 'NEXT_NOT_FOUND',
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error(notFoundSignal);
  }),
}));

describe('NotFoundCatchAllPage', () => {
  it('hands unmatched routes to the not-found boundary instead of rendering', () => {
    expect(() => NotFoundCatchAllPage()).toThrow(notFoundSignal);
    expect(notFound).toHaveBeenCalledTimes(1);
  });
});
