import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { VideoStreamingPlayer } from './VideoStreamingPlayer';

const videoUrl = 'https://example.com/embed/video';

const titleCases: ReadonlyArray<{
  name: string | undefined;
  expectedTitle: string;
}> = [
  { name: 'Product teaser', expectedTitle: 'Product teaser' },
  { name: undefined, expectedTitle: 'Embedded video player' },
];

describe('VideoStreamingPlayer', () => {
  it.each(titleCases)(
    'titles the embedded player "$expectedTitle" when the name is "$name"',
    ({ name, expectedTitle }) => {
      render(
        <VideoStreamingPlayer
          url={videoUrl}
          width={560}
          height={315}
          name={name}
        />
      );

      expect(screen.getByTitle(expectedTitle)).toHaveAttribute('src', videoUrl);
    }
  );

  it('keeps an explicit title over the name-derived one', () => {
    render(
      <VideoStreamingPlayer
        url={videoUrl}
        width={560}
        height={315}
        name="Ignored name"
        title="Explicit title"
      />
    );

    expect(screen.getByTitle('Explicit title')).toHaveAttribute(
      'src',
      videoUrl
    );
  });
});
