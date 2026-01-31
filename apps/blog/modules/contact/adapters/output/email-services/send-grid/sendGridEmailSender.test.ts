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

function createContact(): Contact {
  return Contact.create({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Test message',
  });
}

describe('SendGridEmailSender', () => {
  const apiKey = 'test-api-key';
  const senderEmail = 'sender@example.com';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('sets the API key on initialization', () => {
      new SendGridEmailSender(apiKey, senderEmail);

      expect(mockSetApiKey).toHaveBeenCalledWith(apiKey);
    });
  });

  describe('send', () => {
    it('sends email with correct parameters', async () => {
      mockSend.mockResolvedValue(undefined);
      const sut = new SendGridEmailSender(apiKey, senderEmail);
      const contact = createContact();

      await sut.send(contact, 'Test Subject', '<p>Test body</p>');

      expect(mockSend).toHaveBeenCalledWith({
        to: 'john@example.com',
        from: senderEmail,
        bcc: senderEmail,
        subject: 'Test Subject',
        html: '<p>Test body</p>',
      });
    });

    it('throws EmailSendFailedError when SendGrid returns ResponseError', async () => {
      const responseError = new MockResponseError({ body: 'API Error' });
      mockSend.mockRejectedValue(responseError);
      const sut = new SendGridEmailSender(apiKey, senderEmail);
      const contact = createContact();

      await expect(
        sut.send(contact, 'Subject', '<p>Body</p>')
      ).rejects.toThrow(EmailSendFailedError);
    });

    it('throws EmailSendFailedError with message for generic errors', async () => {
      mockSend.mockRejectedValue(new Error('Network error'));
      const sut = new SendGridEmailSender(apiKey, senderEmail);
      const contact = createContact();

      await expect(sut.send(contact, 'Subject', '<p>Body</p>')).rejects.toThrow(
        EmailSendFailedError
      );
      await expect(sut.send(contact, 'Subject', '<p>Body</p>')).rejects.toThrow(
        'Failed to send email: Network error'
      );
    });

    it('handles unknown error types', async () => {
      mockSend.mockRejectedValue('Unknown error');
      const sut = new SendGridEmailSender(apiKey, senderEmail);
      const contact = createContact();

      await expect(sut.send(contact, 'Subject', '<p>Body</p>')).rejects.toThrow(
        EmailSendFailedError
      );
      await expect(sut.send(contact, 'Subject', '<p>Body</p>')).rejects.toThrow(
        'Failed to send email: Unknown error occurred'
      );
    });
  });
});
