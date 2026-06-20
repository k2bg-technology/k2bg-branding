import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LogoutButton } from './LogoutButton';

const { mockPush, mockSignOut } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockSignOut: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('../../infrastructure/auth/auth-client', () => ({
  authClient: { signOut: mockSignOut },
}));

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signs out and redirects to login', async () => {
    mockSignOut.mockImplementation(
      async (options?: { fetchOptions?: { onSuccess?: () => void } }) => {
        options?.fetchOptions?.onSuccess?.();
      }
    );
    const user = userEvent.setup();
    render(<LogoutButton />);

    await user.click(screen.getByRole('button', { name: 'ログアウト' }));

    expect(mockSignOut).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
