import { describe, expect, it } from 'vitest';

import { buttonVariants } from './Button';

describe('button variant classes', () => {
  it.each([
    {
      props: {},
      expectedClasses: [
        'px-3',
        'h-8',
        'bg-main-default',
        'text-base-white',
        'hover:bg-main-default/90',
      ],
    },
    {
      props: { variant: 'outline', color: 'accent' } as const,
      expectedClasses: [
        'border-2',
        'border-accent-default/20',
        'text-accent-default',
        'hover:bg-accent-default/10',
      ],
    },
    {
      props: { variant: 'ghost', color: 'dark', size: 'sm' } as const,
      expectedClasses: [
        'px-2',
        'h-6',
        'text-base-black',
        'hover:bg-base-black/10',
      ],
    },
    {
      props: { color: 'success', size: 'icon' } as const,
      expectedClasses: [
        'rounded-full',
        'w-10',
        'h-10',
        'bg-success',
        'hover:bg-success/90',
      ],
    },
  ])('maps $props to expected classes', ({ props, expectedClasses }) => {
    const sut = buttonVariants(props);

    expect(sut.split(' ')).toEqual(expect.arrayContaining(expectedClasses));
  });
});
