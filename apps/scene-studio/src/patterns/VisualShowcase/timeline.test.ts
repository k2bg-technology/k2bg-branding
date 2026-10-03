import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';

import {
  calculateVisualShowcaseMetadata,
  getItemDurationInFrames,
} from './timeline';

const props = {
  title: 'Quiet Forms',
  items: [
    {
      mediaType: 'image' as const,
      src: 'https://images.example.com/one.jpg',
      durationInSeconds: 4,
    },
    {
      mediaType: 'video' as const,
      src: 'https://videos.example.com/two.mp4',
      durationInSeconds: 3,
    },
  ],
};

describe('VisualShowcase timeline', () => {
  it('converts item seconds to frames at the scene frame rate', () => {
    const result = getItemDurationInFrames(2.5);

    expect(result).toBe(75);
  });

  it('parses metadata props before deriving the duration', () => {
    const result = calculateVisualShowcaseMetadata({
      props,
      defaultProps: props,
      abortSignal: new AbortController().signal,
      compositionId: 'visual-showcase',
      isRendering: false,
    });

    expect(result).toEqual({ durationInFrames: 255 });
  });

  it('rejects metadata props without showcase items', () => {
    const invalidProps = { ...props, items: [] };

    expect(() =>
      calculateVisualShowcaseMetadata({
        props: invalidProps,
        defaultProps: props,
        abortSignal: new AbortController().signal,
        compositionId: 'visual-showcase',
        isRendering: false,
      })
    ).toThrow(ZodError);
  });
});
