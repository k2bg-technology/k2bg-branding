import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuthorAvatar } from './AuthorAvatar';

// jsdom never fires image load events, so Base UI keeps the fallback visible.
describe('AuthorAvatar', () => {
  it.each([
    { name: 'krd-knt', expectedInitial: 'K' },
    { name: 'Test Author', expectedInitial: 'T' },
    { name: 'unknown author', expectedInitial: 'U' },
  ])(
    'displays fallback initial $expectedInitial for name $name',
    ({ name, expectedInitial }) => {
      render(<AuthorAvatar name={name} avatarUrl={null} />);

      expect(screen.getByText(expectedInitial)).toBeInTheDocument();
    }
  );

  it('displays the fallback initial while the image has not loaded', () => {
    render(
      <AuthorAvatar
        name="Test Author"
        avatarUrl="https://example.com/avatar.jpg"
      />
    );

    expect(screen.getByText('T')).toBeInTheDocument();
  });
});
