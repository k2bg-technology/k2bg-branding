import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { VideoFilePlayer } from './VideoFilePlayer';

const videoFile = 'https://example.com/scene.mp4';
const captionsFile = 'https://example.com/scene.vtt';
const captionsName = 'Scene walkthrough';

describe('VideoFilePlayer', () => {
  it('renders a captions track pointing at the given captions source', () => {
    const { container } = render(
      <VideoFilePlayer
        file={videoFile}
        width={600}
        height={400}
        name={captionsName}
        captionsSource={captionsFile}
      />
    );

    const track = container.querySelector('track');
    expect(track).toHaveAttribute('src', captionsFile);
    expect(track).toHaveAttribute('kind', 'captions');
  });

  it('labels the captions track with the given name', () => {
    const { container } = render(
      <VideoFilePlayer
        file={videoFile}
        width={600}
        height={400}
        name={captionsName}
        captionsSource={captionsFile}
      />
    );

    expect(container.querySelector('track')).toHaveAttribute(
      'label',
      captionsName
    );
  });

  it('renders no track when no captions source is given', () => {
    const { container } = render(
      <VideoFilePlayer file={videoFile} width={600} height={400} />
    );

    expect(container.querySelector('track')).toBeNull();
  });

  it('rejects a captions source without a name at the type level', () => {
    const element = (
      // @ts-expect-error -- a captions track needs a name for its accessible name.
      <VideoFilePlayer
        file={videoFile}
        width={600}
        height={400}
        captionsSource={captionsFile}
      />
    );

    expect(element).toBeDefined();
  });
});
