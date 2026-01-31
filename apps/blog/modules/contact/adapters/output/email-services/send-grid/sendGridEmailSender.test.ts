import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Contact, EmailSendFailedError } from '../../../../domain';
import { SendGridEmailSender } from './sendGridEmailSender';

const { mockSend, mockSetApiKey, MockResponseError } = vi.hoisted(() => {
  const mockSend = vi.fn();
  const mockSetApiKey = vi.fn();

  class MockResponseError extends Error {
    response: { body: unknown };
    constructor(response: { body: unknown }) {
      super('ResponseError');
      this.name = 'ResponseError';
      this.response = response;
    }
  }

  return { mockSend, mockSetApiKey, MockResponseError };
});

vi.mock('@sendgrid/mail', () => ({
  default: {
    send: (...args: unknown[]) => mockSend(...args),
    setApiKey: (...args: unknown[]) => mockSetApiKey(...args),
  },
  ResponseError: MockResponseError,
}));

describe('SendGridEmailSender', () => {
  const apiKey = 'test-api-key';
  const senderEmail = 'sender@example.com';
  let emailSender: SendGridEmailSender;
  let contact: Contact;

  beforeEach(() => {
    vi.clearAllMocks();
    emailSender = new SendGridEmailSender(apiKey, senderEmail);
    contact = Contact.create({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message',
    });
  });

  describe('constructor', () => {
    it('should set the API key on initialization', () => {
      expect(mockSetApiKey).toHaveBeenCalledWith(apiKey);
    });
  });

  describe('send', () => {
    it('should send email with correct parameters', async () => {
      mockSend.mockResolvedValue(undefined);

      await emailSender.send(contact, 'Test Subject', '<p>Test body</p>');

      expect(mockSend).toHaveBeenCalledWith({
        to: 'john@example.com',
        from: senderEmail,
        bcc: senderEmail,
        subject: 'Test Subject',
        html: '<p>Test body</p>',
      });
    });

    it('should throw EmailSendFailedError when SendGrid returns ResponseError', async () => {
      const responseError = new MockResponseError({ body: 'API Error' });
      mockSend.mockRejectedValue(responseError);

      await expect(
        emailSender.send(contact, 'Subject', '<p>Body</p>')
      ).rejects.toThrow(EmailSendFailedError);
    });

    it('should throw EmailSendFailedError with message for generic errors', async () => {
      mockSend.mockRejectedValue(new Error('Network error'));

      await expect(
        emailSender.send(contact, 'Subject', '<p>Body</p>')
      ).rejects.toThrow(EmailSendFailedError);
      await expect(
        emailSender.send(contact, 'Subject', '<p>Body</p>')
      ).rejects.toThrow('Failed to send email: Network error');
    });

    it('should handle unknown error types', async () => {
      mockSend.mockRejectedValue('Unknown error');

      await expect(
        emailSender.send(contact, 'Subject', '<p>Body</p>')
      ).rejects.toThrow(EmailSendFailedError);
      await expect(
        emailSender.send(contact, 'Subject', '<p>Body</p>')
      ).rejects.toThrow('Failed to send email: Unknown error occurred');
    });
  });
});
