import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Page from './page';

describe('Page', () => {
  it('renders the app name as the heading', () => {
    const expectedHeading = 'Observatory';

    render(<Page />);

    expect(
      screen.getByRole('heading', { name: expectedHeading })
    ).toBeInTheDocument();
  });
});
