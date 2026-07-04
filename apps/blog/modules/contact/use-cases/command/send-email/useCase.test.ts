import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { EmailSender } from './emailSender';
import { SendEmail, type SendEmailInput } from './useCase';

vi.mock('date-fns', () => ({
  format: vi.fn().mockReturnValue('2024'),
}));

function createMockEmailSender(): EmailSender {
  return {
    sendToOwner: vi.fn().mockResolvedValue(undefined),
    sendToVisitor: vi.fn().mockResolvedValue(undefined),
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
      const sut = new SendEmail(mockEmailSender);
      const input = createValidInput();

      await sut.execute(input);

      expect(mockEmailSender.sendToOwner).toHaveBeenCalledTimes(1);
      expect(mockEmailSender.sendToVisitor).toHaveBeenCalledTimes(1);

      const expectedOwnerSubject = 'John Doe 様からお問合せが届きました。';
      const expectedVisitorSubject =
        'John Doe 様。お問合せいただきありがとうございます。';

      expect(mockEmailSender.sendToOwner).toHaveBeenCalledWith(
        expectedOwnerSubject,
        expect.stringContaining('Test message')
      );
      expect(mockEmailSender.sendToOwner).toHaveBeenCalledWith(
        expectedOwnerSubject,
        expect.stringContaining('john@example.com')
      );
      expect(mockEmailSender.sendToVisitor).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.objectContaining({ value: 'John Doe' }),
          email: expect.objectContaining({ value: 'john@example.com' }),
          message: expect.objectContaining({ value: 'Test message' }),
        }),
        expectedVisitorSubject,
        expect.not.stringContaining('Test message')
      );
    });

    it('sends owner notification before visitor confirmation', async () => {
      const mockEmailSender = createMockEmailSender();
      const sut = new SendEmail(mockEmailSender);
      const input = createValidInput();

      await sut.execute(input);

      const [ownerCallOrder] = vi.mocked(mockEmailSender.sendToOwner).mock
        .invocationCallOrder;
      const [visitorCallOrder] = vi.mocked(mockEmailSender.sendToVisitor).mock
        .invocationCallOrder;
      expect(ownerCallOrder).toBeLessThan(visitorCallOrder);
    });

    it('throws error when name is empty', async () => {
      const mockEmailSender = createMockEmailSender();
      const sut = new SendEmail(mockEmailSender);
      const invalidInput: SendEmailInput = {
        name: '',
        email: 'john@example.com',
        message: 'Test message',
      };

      await expect(sut.execute(invalidInput)).rejects.toThrow(
        'Name cannot be empty'
      );
      expect(mockEmailSender.sendToOwner).not.toHaveBeenCalled();
      expect(mockEmailSender.sendToVisitor).not.toHaveBeenCalled();
    });

    it('throws error when email format is invalid', async () => {
      const mockEmailSender = createMockEmailSender();
      const sut = new SendEmail(mockEmailSender);
      const invalidInput: SendEmailInput = {
        name: 'John Doe',
        email: 'invalid-email',
        message: 'Test message',
      };

      await expect(sut.execute(invalidInput)).rejects.toThrow(
        'Invalid email format'
      );
      expect(mockEmailSender.sendToOwner).not.toHaveBeenCalled();
      expect(mockEmailSender.sendToVisitor).not.toHaveBeenCalled();
    });

    it('propagates error when email sending fails', async () => {
      const mockEmailSender = createMockEmailSender();
      vi.mocked(mockEmailSender.sendToOwner).mockRejectedValue(
        new Error('Email send failed')
      );
      const sut = new SendEmail(mockEmailSender);
      const input = createValidInput();

      await expect(sut.execute(input)).rejects.toThrow('Email send failed');
    });
  });
});
