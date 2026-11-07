import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EmbeddedMusicPlayer } from './EmbeddedMusicPlayer';

const musicUrl = 'https://example.com/embed/track';

const titleCases: ReadonlyArray<{
  name: string | undefined;
  expectedTitle: string;
}> = [
  { name: 'Night drive session', expectedTitle: 'Night drive session' },
  { name: undefined, expectedTitle: 'Embedded music player' },
];

describe('EmbeddedMusicPlayer', () => {
  it.each(titleCases)(
    'titles the embedded player "$expectedTitle" when the name is "$name"',
    ({ name, expectedTitle }) => {
      render(
        <EmbeddedMusicPlayer
          url={musicUrl}
          width="100%"
          height={152}
          name={name}
        />
      );

      expect(screen.getByTitle(expectedTitle)).toHaveAttribute('src', musicUrl);
    }
  );

  it('keeps an explicit title over the name-derived one', () => {
    render(
      <EmbeddedMusicPlayer
        url={musicUrl}
        width="100%"
        height={152}
        name="Ignored name"
        title="Explicit title"
      />
    );

    expect(screen.getByTitle('Explicit title')).toHaveAttribute(
      'src',
      musicUrl
    );
  });
});
