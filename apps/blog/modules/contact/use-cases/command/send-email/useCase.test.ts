import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Contact } from '../../../domain';
import type { EmailSender } from './emailSender';
import type { EmailTemplateRenderer } from './emailTemplateRenderer';
import { SendEmail, type SendEmailInput } from './useCase';

function createMockEmailSender(): EmailSender {
  return {
    sendToOwner: vi.fn().mockResolvedValue(undefined),
    sendToVisitor: vi.fn().mockResolvedValue(undefined),
  };
}

function createFakeEmailTemplateRenderer(): EmailTemplateRenderer {
  return {
    renderOwnerNotification: vi
      .fn()
      .mockReturnValue('<html>Owner Notification</html>'),
    renderVisitorConfirmation: vi
      .fn()
      .mockReturnValue('<html>Visitor Confirmation</html>'),
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
    it('creates contact and sends both emails with correct parameters', async () => {
      const mockEmailSender = createMockEmailSender();
      const fakeEmailTemplateRenderer = createFakeEmailTemplateRenderer();
      const sut = new SendEmail(mockEmailSender, fakeEmailTemplateRenderer);
      const input = createValidInput();

      await sut.execute(input);

      expect(
        fakeEmailTemplateRenderer.renderOwnerNotification
      ).toHaveBeenCalledTimes(1);
      expect(
        fakeEmailTemplateRenderer.renderVisitorConfirmation
      ).toHaveBeenCalledTimes(1);

      const [renderedContact] = vi.mocked(
        fakeEmailTemplateRenderer.renderOwnerNotification
      ).mock.calls[0] as [Contact];
      expect(renderedContact.name.getValue()).toBe('John Doe');
      expect(renderedContact.email.getValue()).toBe('john@example.com');
      expect(renderedContact.message.getValue()).toBe('Test message');

      const expectedOwnerSubject = 'John Doe 様からお問合せが届きました。';
      const expectedVisitorSubject =
        'John Doe 様。お問合せいただきありがとうございます。';

      expect(mockEmailSender.sendToOwner).toHaveBeenCalledWith(
        expectedOwnerSubject,
        '<html>Owner Notification</html>'
      );

      const [contact, visitorSubject, visitorHtmlBody] = vi.mocked(
        mockEmailSender.sendToVisitor
      ).mock.calls[0] as [Contact, string, string];
      expect(contact.name.getValue()).toBe('John Doe');
      expect(contact.email.getValue()).toBe('john@example.com');
      expect(contact.message.getValue()).toBe('Test message');
      expect(visitorSubject).toBe(expectedVisitorSubject);
      expect(visitorHtmlBody).toBe('<html>Visitor Confirmation</html>');
    });

    it('sends owner notification before visitor confirmation', async () => {
      const mockEmailSender = createMockEmailSender();
      const fakeEmailTemplateRenderer = createFakeEmailTemplateRenderer();
      const sut = new SendEmail(mockEmailSender, fakeEmailTemplateRenderer);
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
      expect(
        fakeEmailTemplateRenderer.renderOwnerNotification
      ).not.toHaveBeenCalled();
      expect(mockEmailSender.sendToOwner).not.toHaveBeenCalled();
      expect(mockEmailSender.sendToVisitor).not.toHaveBeenCalled();
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
      expect(
        fakeEmailTemplateRenderer.renderOwnerNotification
      ).not.toHaveBeenCalled();
      expect(mockEmailSender.sendToOwner).not.toHaveBeenCalled();
      expect(mockEmailSender.sendToVisitor).not.toHaveBeenCalled();
    });

    it('propagates error when email sending fails', async () => {
      const mockEmailSender = createMockEmailSender();
      vi.mocked(mockEmailSender.sendToOwner).mockRejectedValue(
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
      vi.mocked(
        fakeEmailTemplateRenderer.renderOwnerNotification
      ).mockImplementation(() => {
        throw new Error('Template render failed');
      });
      const sut = new SendEmail(mockEmailSender, fakeEmailTemplateRenderer);
      const input = createValidInput();

      await expect(sut.execute(input)).rejects.toThrow(
        'Template render failed'
      );
      expect(mockEmailSender.sendToOwner).not.toHaveBeenCalled();
      expect(mockEmailSender.sendToVisitor).not.toHaveBeenCalled();
    });
  });
});
