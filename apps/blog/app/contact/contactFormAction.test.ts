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

  it('checks the rate limit with the hashed proxy-appended IP before verifying hCaptcha', async () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message',
      token: 'valid-token',
    };

    await contactFormAction(data);

    const expectedIpHash =
      '7f60d869b36f6e64c0c99395754c14658bc62173eadceb489ea008ddfe76398d';
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
