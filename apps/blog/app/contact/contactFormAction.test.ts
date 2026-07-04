import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContactRateLimitExceededError } from '../../modules/contact/use-cases';
import { contactFormAction } from './contactFormAction';

const {
  mockCreateEnforceContactRateLimitUseCase,
  mockCreateSendEmailUseCase,
  mockEnforceContactRateLimitExecute,
  mockHeaders,
  mockSendEmailExecute,
  mockVerify,
} = vi.hoisted(() => ({
  mockCreateEnforceContactRateLimitUseCase: vi.fn(),
  mockCreateSendEmailUseCase: vi.fn(),
  mockEnforceContactRateLimitExecute: vi.fn(),
  mockHeaders: vi.fn(),
  mockSendEmailExecute: vi.fn(),
  mockVerify: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: mockHeaders,
}));

vi.mock('hcaptcha', () => ({
  verify: mockVerify,
}));

vi.mock('../../infrastructure/di', () => ({
  createEnforceContactRateLimitUseCase:
    mockCreateEnforceContactRateLimitUseCase,
  createSendEmailUseCase: mockCreateSendEmailUseCase,
}));

vi.mock('../../modules/contact/adapters/shared', () => ({
  contactLogger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('contactFormAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue({
      get: vi.fn().mockReturnValue('203.0.113.1, 198.51.100.1'),
    });
    mockVerify.mockResolvedValue({ success: true });
    mockCreateEnforceContactRateLimitUseCase.mockReturnValue({
      execute: mockEnforceContactRateLimitExecute,
    });
    mockCreateSendEmailUseCase.mockReturnValue({
      execute: mockSendEmailExecute,
    });
    mockEnforceContactRateLimitExecute.mockResolvedValue(undefined);
    mockSendEmailExecute.mockResolvedValue(undefined);
  });

  it('checks the rate limit with a hashed client IP before verifying hCaptcha', async () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message',
      token: 'valid-token',
    };

    await contactFormAction(data);

    const expectedIpHash =
      'a1ceb3dc7b127ea22d04f67b50908245930cfa9a3f91e1d38c0b266c44669ee7';
    expect(mockEnforceContactRateLimitExecute).toHaveBeenCalledWith({
      ipHash: expectedIpHash,
    });
    const [rateLimitCallOrder] =
      mockEnforceContactRateLimitExecute.mock.invocationCallOrder;
    const [hCaptchaCallOrder] = mockVerify.mock.invocationCallOrder;
    expect(rateLimitCallOrder).toBeLessThan(hCaptchaCallOrder);
  });

  it('returns the user-facing message when the rate limit is exceeded', async () => {
    mockEnforceContactRateLimitExecute.mockRejectedValue(
      new ContactRateLimitExceededError()
    );
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message',
      token: 'valid-token',
    };

    await expect(contactFormAction(data)).rejects.toThrow(
      '送信回数の上限に達しました。しばらくしてからお試しください。'
    );

    expect(mockVerify).not.toHaveBeenCalled();
    expect(mockSendEmailExecute).not.toHaveBeenCalled();
  });
});
