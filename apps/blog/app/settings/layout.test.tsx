import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SettingsLayout from './layout';

const { mockGetSession, mockRedirect } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockRedirect: vi.fn(),
}));

vi.mock('../../infrastructure/auth/getSession', () => ({
  getSession: mockGetSession,
}));

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

describe('SettingsLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login when there is no session', async () => {
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });
    mockGetSession.mockResolvedValue(null);

    await expect(SettingsLayout({ children: <div /> })).rejects.toThrow(
      'NEXT_REDIRECT'
    );
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('renders children when a session exists', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });

    render(await SettingsLayout({ children: <div data-testid="content" /> }));

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});
