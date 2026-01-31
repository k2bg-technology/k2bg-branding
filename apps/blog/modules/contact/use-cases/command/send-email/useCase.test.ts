import { describe, expect, it, vi } from 'vitest';

import type { Contact, EmailSender } from '../../../domain';
import { SendEmailError } from '../../shared';
import { SendEmail } from './useCase';

vi.mock('../../../adapters', () => ({
  generateHtmlTemplate: vi
    .fn()
    .mockReturnValue('<html><body>Test Email</body></html>'),
}));

describe('SendEmail', () => {
  const createMockEmailSender = (
    overrides: Partial<EmailSender> = {}
  ): EmailSender => ({
    sendEmail: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  describe('execute', () => {
    it('sends email with valid input', async () => {
      const sendEmail = vi.fn().mockResolvedValue(undefined);
      const emailSender = createMockEmailSender({ sendEmail });
      const sut = new SendEmail(emailSender);

      await sut.execute({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, world!',
      });

      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          toObject: expect.any(Function),
        }) as Contact,
        'John Doe 様。お問合せいただきありがとうございます。',
        expect.any(String)
      );
    });

    it('throws SendEmailError when input validation fails', async () => {
      const emailSender = createMockEmailSender();
      const sut = new SendEmail(emailSender);

      await expect(
        sut.execute({
          name: '',
          email: 'john@example.com',
          message: 'Hello',
        })
      ).rejects.toThrow(SendEmailError);
    });

    it('throws SendEmailError when email is invalid', async () => {
      const emailSender = createMockEmailSender();
      const sut = new SendEmail(emailSender);

      await expect(
        sut.execute({
          name: 'John',
          email: 'invalid-email',
          message: 'Hello',
        })
      ).rejects.toThrow(SendEmailError);
    });

    it('throws SendEmailError when message is empty', async () => {
      const emailSender = createMockEmailSender();
      const sut = new SendEmail(emailSender);

      await expect(
        sut.execute({
          name: 'John',
          email: 'john@example.com',
          message: '',
        })
      ).rejects.toThrow(SendEmailError);
    });

    it('throws SendEmailError when email sending fails', async () => {
      const emailSender = createMockEmailSender({
        sendEmail: vi.fn().mockRejectedValue(new Error('Network error')),
      });
      const sut = new SendEmail(emailSender);

      await expect(
        sut.execute({
          name: 'John',
          email: 'john@example.com',
          message: 'Hello',
        })
      ).rejects.toThrow(SendEmailError);
    });
  });
});
