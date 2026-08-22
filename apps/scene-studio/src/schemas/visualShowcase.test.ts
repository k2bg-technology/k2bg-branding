import { describe, expect, it } from 'vitest';

import { visualShowcaseSchema } from './visualShowcase';

const validProps = {
  title: 'Quiet Forms',
  subtitle: 'A visual study',
  items: [
    {
      mediaType: 'image' as const,
      src: 'https://images.example.com/quiet-forms.jpg',
      durationInSeconds: 4,
      caption: 'Morning light',
    },
  ],
  cta: 'Explore more work',
};

describe('visualShowcaseSchema', () => {
  it('accepts constrained showcase input', () => {
    const result = visualShowcaseSchema.safeParse(validProps);

    expect(result.success).toBe(true);
  });

  it.each([
    {
      description: 'has no items',
      props: { ...validProps, items: [] },
      expectedPath: 'items',
    },
    {
      description: 'uses a duration shorter than two seconds',
      props: {
        ...validProps,
        items: [{ ...validProps.items[0], durationInSeconds: 1 }],
      },
      expectedPath: 'items.0.durationInSeconds',
    },
    {
      description: 'uses an unsupported media type',
      props: {
        ...validProps,
        items: [{ ...validProps.items[0], mediaType: 'audio' }],
      },
      expectedPath: 'items.0.mediaType',
    },
  ])('rejects input that $description', ({ props, expectedPath }) => {
    const result = visualShowcaseSchema.safeParse(props);

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues[0]?.path.join('.')).toBe(expectedPath);
  });
});
