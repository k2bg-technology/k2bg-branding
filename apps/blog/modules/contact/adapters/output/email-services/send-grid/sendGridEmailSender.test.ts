import { ResponseError } from '@sendgrid/mail';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Contact, Email, EmailSendError, Message, Name } from '../../../../domain';
import { SendGridEmailSender } from './sendGridEmailSender';

vi.mock('@sendgrid/mail', () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn(),
  },
  ResponseError: class ResponseError extends Error {
    response = { body: 'error body' };
  },
}));

function createTestContact(): Contact {
  return Contact.create({
    name: Name.create('John Doe'),
    email: Email.create('john@example.com'),
    message: Message.create('Test message'),
  });
}

describe('SendGridEmailSender', () => {
  let sut: SendGridEmailSender;

  beforeEach(() => {
    vi.resetAllMocks();
    sut = new SendGridEmailSender();
  });

  describe('send', () => {
    it('sends email successfully', async () => {
      const contact = createTestContact();
      const subject = 'Test Subject';
      const emailBody = '<p>Test body</p>';
      const sgMail = await import('@sendgrid/mail');
      vi.mocked(sgMail.default.send).mockResolvedValue([
        { statusCode: 202, headers: {}, body: '' },
        {},
      ]);

      await expect(sut.send(contact, subject, emailBody)).resolves.toBeUndefined();

      expect(sgMail.default.send).toHaveBeenCalledWith({
        to: 'john@example.com',
        from: '',
        bcc: '',
        subject: 'Test Subject',
        html: '<p>Test body</p>',
      });
    });

    it('throws EmailSendError when SendGrid returns ResponseError', async () => {
      const contact = createTestContact();
      const sgMail = await import('@sendgrid/mail');
      const responseError = new ResponseError({
        message: 'Bad Request',
        code: 400,
        response: {
          headers: {},
          body: { errors: [{ message: 'Invalid email' }] },
          statusCode: 400,
        },
      });
      vi.mocked(sgMail.default.send).mockRejectedValue(responseError);

      await expect(sut.send(contact, 'Subject', 'Body')).rejects.toThrow(
        EmailSendError
      );
    });

    it('throws EmailSendError for unknown errors', async () => {
      const contact = createTestContact();
      const sgMail = await import('@sendgrid/mail');
      vi.mocked(sgMail.default.send).mockRejectedValue(new Error('Network error'));

      await expect(sut.send(contact, 'Subject', 'Body')).rejects.toThrow(
        EmailSendError
      );
      await expect(sut.send(contact, 'Subject', 'Body')).rejects.toThrow(
        'Unknown error occurred while sending email'
      );
    });
  });
});
