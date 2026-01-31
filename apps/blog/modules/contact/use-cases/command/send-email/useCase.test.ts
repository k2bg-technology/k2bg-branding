import fs from 'fs';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Contact, EmailSender } from '../../../domain';
import { InvalidEmailError, InvalidMessageError, InvalidNameError } from '../../../domain';
import { SendEmail } from './useCase';

vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn(),
  },
}));

vi.mock('date-fns', () => ({
  format: vi.fn().mockReturnValue('2024'),
}));

function createMockEmailSender(): EmailSender {
  return {
    send: vi.fn().mockResolvedValue(undefined),
  };
}

describe('SendEmail', () => {
  let mockEmailSender: EmailSender;
  let sut: SendEmail;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(fs.readFileSync).mockReturnValue(
      '<p>Hello {{name}}, {{message}}, {{year}}</p>'
    );
    mockEmailSender = createMockEmailSender();
    sut = new SendEmail(mockEmailSender);
  });

  describe('execute', () => {
    it('sends email with valid input', async () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, this is a test message.',
      };

      const result = await sut.execute(input);

      expect(result.success).toBe(true);
      expect(mockEmailSender.send).toHaveBeenCalledTimes(1);
    });

    it('generates correct email subject', async () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      };

      await sut.execute(input);

      const expectedSubject = 'John Doe 様。お問合せいただきありがとうございます。';
      expect(mockEmailSender.send).toHaveBeenCalledWith(
        expect.any(Object),
        expectedSubject,
        expect.any(String)
      );
    });

    it('generates email body from template', async () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      };

      await sut.execute(input);

      expect(mockEmailSender.send).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.objectContaining({
            getValue: expect.any(Function),
          }),
          email: expect.objectContaining({
            getValue: expect.any(Function),
          }),
        }),
        expect.any(String),
        '<p>Hello John Doe, Test message, 2024</p>'
      );
    });

    it('passes contact entity to email sender', async () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      };

      await sut.execute(input);

      const callArgs = vi.mocked(mockEmailSender.send).mock.calls[0];
      const contact = callArgs[0] as Contact;
      expect(contact.name.getValue()).toBe('John Doe');
      expect(contact.email.getValue()).toBe('john@example.com');
      expect(contact.message.getValue()).toBe('Test message');
    });

    it('throws InvalidNameError when name is empty', async () => {
      const input = {
        name: '',
        email: 'john@example.com',
        message: 'Test message',
      };

      await expect(sut.execute(input)).rejects.toThrow(InvalidNameError);
    });

    it('throws InvalidEmailError when email is invalid', async () => {
      const input = {
        name: 'John Doe',
        email: 'invalid-email',
        message: 'Test message',
      };

      await expect(sut.execute(input)).rejects.toThrow(InvalidEmailError);
    });

    it('throws InvalidMessageError when message is empty', async () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        message: '',
      };

      await expect(sut.execute(input)).rejects.toThrow(InvalidMessageError);
    });

    it('propagates error when email sender fails', async () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      };
      vi.mocked(mockEmailSender.send).mockRejectedValue(
        new Error('Email sending failed')
      );

      await expect(sut.execute(input)).rejects.toThrow('Email sending failed');
    });
  });
});
