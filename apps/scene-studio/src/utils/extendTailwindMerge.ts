import { extendTailwindMerge } from 'tailwind-merge';

export const twMerge = extendTailwindMerge({
  /**
   * Register the scene font-size classes so tailwind-merge does not
   * misclassify them as text colors.
   *
   * @see https://github.com/dcastil/tailwind-merge/issues/368
   */
  override: {
    classGroups: {
      'font-size': [
        'text-scene-title',
        'text-scene-subtitle',
        'text-scene-cta',
        'text-scene-caption',
      ],
    },
  },
});
