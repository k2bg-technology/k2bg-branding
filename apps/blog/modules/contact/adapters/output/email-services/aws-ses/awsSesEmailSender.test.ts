import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Contact, EmailSendFailedError } from '../../../../domain';
import { AwsSesEmailSender } from './awsSesEmailSender';

const { mockSend, MockSESClient, MockSendEmailCommand } = vi.hoisted(() => {
  const mockSend = vi.fn();

  class MockSESClient {
    send = mockSend;
  }

  class MockSendEmailCommand {
    input: unknown;
    constructor(input: unknown) {
      this.input = input;
    }
  }

  return { mockSend, MockSESClient, MockSendEmailCommand };
});

vi.mock('@aws-sdk/client-ses', () => ({
  SESClient: MockSESClient,
  SendEmailCommand: MockSendEmailCommand,
}));

function createContact(): Contact {
  return Contact.create({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Test message',
  });
}

describe('AwsSesEmailSender', () => {
  const senderEmail = 'sender@example.com';
  let mockSesClient: InstanceType<typeof MockSESClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSesClient = new MockSESClient();
  });

  describe('send', () => {
    it('sends email with correct parameters', async () => {
      mockSend.mockResolvedValue({});
      const sut = new AwsSesEmailSender(
        mockSesClient as unknown as ConstructorParameters<
          typeof AwsSesEmailSender
        >[0],
        senderEmail
      );
      const contact = createContact();

      await sut.send(contact, 'Test Subject', '<p>Test body</p>');

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command).toBeInstanceOf(MockSendEmailCommand);
      expect(command.input).toEqual({
        Source: senderEmail,
        Destination: {
          ToAddresses: ['john@example.com'],
          BccAddresses: [senderEmail],
        },
        Message: {
          Subject: { Data: 'Test Subject', Charset: 'UTF-8' },
          Body: { Html: { Data: '<p>Test body</p>', Charset: 'UTF-8' } },
        },
      });
    });

    it('includes sender email in BCC', async () => {
      mockSend.mockResolvedValue({});
      const sut = new AwsSesEmailSender(
        mockSesClient as unknown as ConstructorParameters<
          typeof AwsSesEmailSender
        >[0],
        senderEmail
      );
      const contact = createContact();

      await sut.send(contact, 'Subject', '<p>Body</p>');

      const command = mockSend.mock.calls[0][0];
      expect(command.input.Destination.BccAddresses).toContain(senderEmail);
    });

    it('throws EmailSendFailedError when SES returns an error', async () => {
      const sesError = new Error('SES API Error');
      mockSend.mockRejectedValue(sesError);
      const sut = new AwsSesEmailSender(
        mockSesClient as unknown as ConstructorParameters<
          typeof AwsSesEmailSender
        >[0],
        senderEmail
      );
      const contact = createContact();

      await expect(sut.send(contact, 'Subject', '<p>Body</p>')).rejects.toThrow(
        EmailSendFailedError
      );
      await expect(sut.send(contact, 'Subject', '<p>Body</p>')).rejects.toThrow(
        'Failed to send email: SES API Error'
      );
    });

    it('handles unknown error types', async () => {
      mockSend.mockRejectedValue('Unknown error');
      const sut = new AwsSesEmailSender(
        mockSesClient as unknown as ConstructorParameters<
          typeof AwsSesEmailSender
        >[0],
        senderEmail
      );
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
