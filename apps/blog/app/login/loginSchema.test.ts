import { describe, expect, it } from 'vitest';

import { loginSchema } from './loginSchema';

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'admin@example.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
  });

  it.each([
    {
      scenario: 'empty email',
      input: { email: '', password: 'password123' },
      expectedMessage: 'メールアドレスを入力してください',
    },
    {
      scenario: 'malformed email',
      input: { email: 'not-an-email', password: 'password123' },
      expectedMessage: '有効なメールアドレスを入力してください',
    },
    {
      scenario: 'empty password',
      input: { email: 'admin@example.com', password: '' },
      expectedMessage: 'パスワードを入力してください',
    },
  ])('rejects $scenario', ({ input, expectedMessage }) => {
    expect(() => loginSchema.parse(input)).toThrow(expectedMessage);
  });
});
