import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Contact } from '../../../domain';
import type { EmailSender } from './emailSender';
import type { EmailTemplateRenderer } from './emailTemplateRenderer';
import { SendEmail, type SendEmailInput } from './useCase';

function createMockEmailSender(): EmailSender {
  return {
    send: vi.fn().mockResolvedValue(undefined),
  };
}

function createFakeEmailTemplateRenderer(): EmailTemplateRenderer {
  return {
    render: vi.fn().mockReturnValue('<html>Test Email</html>'),
  };
}

function createValidInput(): SendEmailInput {
  return {
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Test message',
  };
}

describe('SendEmail Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('execute', () => {
    it('creates contact and sends email with correct parameters', async () => {
      const mockEmailSender = createMockEmailSender();
      const fakeEmailTemplateRenderer = createFakeEmailTemplateRenderer();
      const sut = new SendEmail(mockEmailSender, fakeEmailTemplateRenderer);
      const input = createValidInput();

      await sut.execute(input);

      expect(fakeEmailTemplateRenderer.render).toHaveBeenCalledTimes(1);

      const [renderedContact] = vi.mocked(fakeEmailTemplateRenderer.render).mock
        .calls[0] as [Contact];
      expect(renderedContact.name.getValue()).toBe('John Doe');
      expect(renderedContact.email.getValue()).toBe('john@example.com');
      expect(renderedContact.message.getValue()).toBe('Test message');

      expect(mockEmailSender.send).toHaveBeenCalledTimes(1);

      const [contact, subject, htmlBody] = vi.mocked(mockEmailSender.send).mock
        .calls[0] as [Contact, string, string];
      const expectedSubject =
        'John Doe 様。お問合せいただきありがとうございます。';
      const expectedHtmlBody = '<html>Test Email</html>';

      expect(contact.name.getValue()).toBe('John Doe');
      expect(contact.email.getValue()).toBe('john@example.com');
      expect(contact.message.getValue()).toBe('Test message');
      expect(subject).toBe(expectedSubject);
      expect(htmlBody).toBe(expectedHtmlBody);
    });

    it('throws error when name is empty', async () => {
      const mockEmailSender = createMockEmailSender();
      const fakeEmailTemplateRenderer = createFakeEmailTemplateRenderer();
      const sut = new SendEmail(mockEmailSender, fakeEmailTemplateRenderer);
      const invalidInput: SendEmailInput = {
        name: '',
        email: 'john@example.com',
        message: 'Test message',
      };

      await expect(sut.execute(invalidInput)).rejects.toThrow(
        'Name cannot be empty'
      );
      expect(fakeEmailTemplateRenderer.render).not.toHaveBeenCalled();
      expect(mockEmailSender.send).not.toHaveBeenCalled();
    });

    it('throws error when email format is invalid', async () => {
      const mockEmailSender = createMockEmailSender();
      const fakeEmailTemplateRenderer = createFakeEmailTemplateRenderer();
      const sut = new SendEmail(mockEmailSender, fakeEmailTemplateRenderer);
      const invalidInput: SendEmailInput = {
        name: 'John Doe',
        email: 'invalid-email',
        message: 'Test message',
      };

      await expect(sut.execute(invalidInput)).rejects.toThrow(
        'Invalid email format'
      );
      expect(fakeEmailTemplateRenderer.render).not.toHaveBeenCalled();
      expect(mockEmailSender.send).not.toHaveBeenCalled();
    });

    it('propagates error when email sending fails', async () => {
      const mockEmailSender = createMockEmailSender();
      vi.mocked(mockEmailSender.send).mockRejectedValue(
        new Error('Email send failed')
      );
      const fakeEmailTemplateRenderer = createFakeEmailTemplateRenderer();
      const sut = new SendEmail(mockEmailSender, fakeEmailTemplateRenderer);
      const input = createValidInput();

      await expect(sut.execute(input)).rejects.toThrow('Email send failed');
    });

    it('propagates error when template rendering fails', async () => {
      const mockEmailSender = createMockEmailSender();
      const fakeEmailTemplateRenderer = createFakeEmailTemplateRenderer();
      vi.mocked(fakeEmailTemplateRenderer.render).mockImplementation(() => {
        throw new Error('Template render failed');
      });
      const sut = new SendEmail(mockEmailSender, fakeEmailTemplateRenderer);
      const input = createValidInput();

      await expect(sut.execute(input)).rejects.toThrow(
        'Template render failed'
      );
      expect(mockEmailSender.send).not.toHaveBeenCalled();
    });
  });
});
