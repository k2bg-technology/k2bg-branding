import { describe, expect, it, vi } from 'vitest';

import type { EmailSender, Visitor } from '../../../domain';
import { SendEmailError } from '../../shared';
import { SendEmail } from './useCase';

// Mock generateHtmlTemplate
vi.mock('../../../adapters', () => ({
  generateHtmlTemplate: vi.fn().mockReturnValue('<html>Test Email</html>'),
}));

describe('SendEmail', () => {
  const createMockEmailSender = (
    overrides: Partial<EmailSender> = {}
  ): EmailSender => ({
    sendEmail: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  const createVisitor = (overrides: Partial<Visitor> = {}): Visitor => ({
    name: 'Test User',
    email: 'test@example.com',
    message: 'This is a test message',
    ...overrides,
  });

  describe('execute', () => {
    it('sends email with correct subject and visitor data', async () => {
      const emailSender = createMockEmailSender();
      const visitor = createVisitor();
      const sut = new SendEmail(emailSender);

      await sut.execute(visitor);

      expect(emailSender.sendEmail).toHaveBeenCalledTimes(1);
      expect(emailSender.sendEmail).toHaveBeenCalledWith(
        visitor,
        'Test User 様。お問合せいただきありがとうございます。',
        '<html>Test Email</html>'
      );
    });

    it('uses visitor name in subject', async () => {
      const emailSender = createMockEmailSender();
      const visitor = createVisitor({ name: '山田太郎' });
      const sut = new SendEmail(emailSender);

      await sut.execute(visitor);

      expect(emailSender.sendEmail).toHaveBeenCalledWith(
        expect.anything(),
        '山田太郎 様。お問合せいただきありがとうございます。',
        expect.anything()
      );
    });

    it('throws SendEmailError when email sending fails', async () => {
      const sendEmail = vi.fn().mockRejectedValue(new Error('Network error'));
      const emailSender = createMockEmailSender({ sendEmail });
      const visitor = createVisitor();
      const sut = new SendEmail(emailSender);

      await expect(sut.execute(visitor)).rejects.toThrow(SendEmailError);
      await expect(sut.execute(visitor)).rejects.toThrow(
        'Failed to send contact email'
      );
    });

    it('re-throws SendEmailError if already wrapped', async () => {
      const originalError = new SendEmailError(new Error('Original error'));
      const sendEmail = vi.fn().mockRejectedValue(originalError);
      const emailSender = createMockEmailSender({ sendEmail });
      const visitor = createVisitor();
      const sut = new SendEmail(emailSender);

      await expect(sut.execute(visitor)).rejects.toBe(originalError);
    });

    it('sends email to the correct visitor email address', async () => {
      const emailSender = createMockEmailSender();
      const visitor = createVisitor({ email: 'custom@domain.com' });
      const sut = new SendEmail(emailSender);

      await sut.execute(visitor);

      expect(emailSender.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'custom@domain.com' }),
        expect.anything(),
        expect.anything()
      );
    });
  });
});
