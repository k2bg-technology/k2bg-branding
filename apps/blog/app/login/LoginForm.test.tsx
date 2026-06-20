import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginForm } from './LoginForm';

const { mockPush, mockToastError, mockSignInEmail } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockToastError: vi.fn(),
  mockSignInEmail: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('../../infrastructure/auth/auth-client', () => ({
  authClient: { signIn: { email: mockSignInEmail } },
}));

vi.mock('ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ui')>();
  return {
    ...actual,
    useToast: () => ({ toast: { error: mockToastError, success: vi.fn() } }),
  };
});

function renderLoginForm() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <LoginForm />
    </QueryClientProvider>
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to the settings screen when sign-in succeeds', async () => {
    mockSignInEmail.mockResolvedValue({ data: { user: {} }, error: null });
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(
      screen.getByLabelText('メールアドレス'),
      'admin@example.com'
    );
    await user.type(screen.getByLabelText('パスワード'), 'password123');
    await user.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/settings'));
    expect(mockSignInEmail).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'password123',
    });
  });

  it('shows an error and does not redirect when credentials are invalid', async () => {
    mockSignInEmail.mockResolvedValue({
      data: null,
      error: { message: 'Invalid email or password' },
    });
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(
      screen.getByLabelText('メールアドレス'),
      'admin@example.com'
    );
    await user.type(screen.getByLabelText('パスワード'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => expect(mockToastError).toHaveBeenCalled());
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('blocks submission and shows a validation error when fields are empty', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.click(screen.getByRole('button', { name: 'ログイン' }));

    expect(
      await screen.findByText('メールアドレスを入力してください')
    ).toBeInTheDocument();
    expect(mockSignInEmail).not.toHaveBeenCalled();
  });
});
