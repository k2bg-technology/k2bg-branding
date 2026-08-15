import { describe, expect, it } from 'vitest';

import {
  calculateVisualShowcaseMetadata,
  getItemDurationInFrames,
  getVisualShowcaseDurationInFrames,
  VISUAL_SHOWCASE_TRANSITION_DURATION_IN_FRAMES,
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

  it('overlaps each item transition and appends the brand outro', () => {
    const result = getVisualShowcaseDurationInFrames(props);

    expect(result).toBe(
      4 * 30 + 3 * 30 - VISUAL_SHOWCASE_TRANSITION_DURATION_IN_FRAMES * 2 + 75
    );
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

  it('fails with Zod details when metadata props are invalid', () => {
    const invalidProps = { ...props, items: [] };

    expect(() =>
      calculateVisualShowcaseMetadata({
        props: invalidProps,
        defaultProps: props,
        abortSignal: new AbortController().signal,
        compositionId: 'visual-showcase',
        isRendering: false,
      })
    ).toThrow('Array must contain at least 1 element');
  });
});
