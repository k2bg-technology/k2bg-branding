import type React from 'react';
import { describe, expect, it } from 'vitest';

import { resolveAriaDescribedBy, resolveAriaInvalid } from './Context';

type AriaInvalid = React.AriaAttributes['aria-invalid'];

const ariaInvalidCases: ReadonlyArray<{
  explicitAriaInvalid: AriaInvalid;
  error: boolean | undefined;
  expected: AriaInvalid;
}> = [
  { explicitAriaInvalid: undefined, error: true, expected: true },
  { explicitAriaInvalid: undefined, error: false, expected: undefined },
  { explicitAriaInvalid: undefined, error: undefined, expected: undefined },
  { explicitAriaInvalid: 'grammar', error: true, expected: 'grammar' },
  { explicitAriaInvalid: 'spelling', error: false, expected: 'spelling' },
  { explicitAriaInvalid: false, error: true, expected: false },
  { explicitAriaInvalid: true, error: undefined, expected: true },
];

const ariaDescribedByCases: ReadonlyArray<{
  explicitAriaDescribedBy: string | undefined;
  helperTextId: string | undefined;
  expected: string | undefined;
}> = [
  {
    explicitAriaDescribedBy: undefined,
    helperTextId: undefined,
    expected: undefined,
  },
  {
    explicitAriaDescribedBy: 'extra-hint',
    helperTextId: undefined,
    expected: 'extra-hint',
  },
  {
    explicitAriaDescribedBy: undefined,
    helperTextId: 'helper-id',
    expected: 'helper-id',
  },
  {
    explicitAriaDescribedBy: 'extra-hint',
    helperTextId: 'helper-id',
    expected: 'extra-hint helper-id',
  },
  {
    explicitAriaDescribedBy: '',
    helperTextId: 'helper-id',
    expected: 'helper-id',
  },
  { explicitAriaDescribedBy: '', helperTextId: '', expected: undefined },
];

describe('resolveAriaInvalid', () => {
  it.each(ariaInvalidCases)(
    'returns "$expected" for the explicit value "$explicitAriaInvalid" and error "$error"',
    ({ explicitAriaInvalid, error, expected }) => {
      const result = resolveAriaInvalid(explicitAriaInvalid, error);

      expect(result).toBe(expected);
    }
  );
});

describe('resolveAriaDescribedBy', () => {
  it.each(ariaDescribedByCases)(
    'returns "$expected" for the explicit value "$explicitAriaDescribedBy" and helper text id "$helperTextId"',
    ({ explicitAriaDescribedBy, helperTextId, expected }) => {
      const result = resolveAriaDescribedBy(
        explicitAriaDescribedBy,
        helperTextId
      );

      expect(result).toBe(expected);
    }
  );
});
