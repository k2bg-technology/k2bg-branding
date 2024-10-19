import { extendTailwindMerge } from 'tailwind-merge';

// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-extraneous-dependencies
const sharedConfig = require('tailwind-config');

export const twMerge = extendTailwindMerge({
  /**
   * WARNING: wrong merge of classes with text-prefix
   *
   * @see https://github.com/dcastil/tailwind-merge/issues/368
   */
  override: {
    classGroups: {
      'font-size': Object.keys(sharedConfig?.theme?.extend?.fontSize).map(
        (size) => `text-${size}`
      ),
    },
  },
});
