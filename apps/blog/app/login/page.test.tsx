import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LoginPage from './page';

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

vi.mock('./LoginForm', () => ({
  LoginForm: () => <div data-testid="login-form" />,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to the settings screen when a session exists', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });

    await LoginPage();

    expect(mockRedirect).toHaveBeenCalledWith('/settings');
  });

  it('renders the login form when there is no session', async () => {
    mockGetSession.mockResolvedValue(null);

    render(await LoginPage());

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });
});
