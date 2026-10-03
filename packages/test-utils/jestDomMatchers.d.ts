import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import 'vitest';

// `@testing-library/jest-dom/vitest` augments `Assertion<T>`, but Vitest 5
// declares `Assertion<R, T>`, so that augmentation no longer merges. Augment
// `Matchers<R, T>` (which `Assertion` extends) to type the matchers that
// setupTests.ts registers at runtime.
declare module 'vitest' {
  interface Matchers<
    R extends void | Promise<void> = void | Promise<void>,
    T = unknown,
  > extends TestingLibraryMatchers<unknown, R> {}
}
