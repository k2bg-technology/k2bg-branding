import { extendTailwindMerge } from 'tailwind-merge';

export const twMerge = extendTailwindMerge({
  /**
   * WARNING: wrong merge of classes with text-prefix
   *
   * @see https://github.com/dcastil/tailwind-merge/issues/368
   */
  override: {
    classGroups: {
      'font-size': [
        'text-advert',
        'text-slogan',
        'text-big-header',
        'text-caption',
        'text-heading-1',
        'text-heading-2',
        'text-heading-3',
        'text-heading-4',
        'text-heading-5',
        'text-heading-6',
        'text-subtitle-lg',
        'text-subtitle-md',
        'text-subtitle-sm',
        'text-body-r-lg',
        'text-body-r-md',
        'text-body-r-sm',
        'text-body-b-lg',
        'text-body-b-md',
        'text-body-b-sm',
        'text-button-b-lg',
        'text-button-b-md',
        'text-button-b-sm',
        'text-button-r-lg',
        'text-button-r-md',
        'text-button-r-sm',
      ],
    },
  },
});
