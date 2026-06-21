import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SettingsPage from './page';

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

vi.mock('./LogoutButton', () => ({
  LogoutButton: () => <button type="button">ログアウト</button>,
}));

vi.mock('./SyncTriggers', () => ({
  SyncTriggers: () => <div>SyncTriggers</div>,
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays the logged-in user email', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'admin@example.com' },
    });

    render(await SettingsPage());

    expect(screen.getByText(/admin@example.com/)).toBeInTheDocument();
  });

  it('redirects to login when there is no session', async () => {
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });
    mockGetSession.mockResolvedValue(null);

    await expect(SettingsPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });
});
