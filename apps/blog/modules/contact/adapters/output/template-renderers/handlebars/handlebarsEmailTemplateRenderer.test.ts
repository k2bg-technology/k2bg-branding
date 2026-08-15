import path from 'path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Contact } from '../../../../domain';
import { RepositoryError } from '../../../shared';
import { HandlebarsEmailTemplateRenderer } from './handlebarsEmailTemplateRenderer';

const { mockGenerateHtmlTemplate } = vi.hoisted(() => ({
  mockGenerateHtmlTemplate: vi.fn(),
}));

vi.mock('../../../shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../shared')>();
  return {
    ...actual,
    generateHtmlTemplate: mockGenerateHtmlTemplate,
  };
});

function createContact(): Contact {
  return Contact.create({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Test message',
  });
}

describe('HandlebarsEmailTemplateRenderer', () => {
  const originalCompanyLogoUrl = process.env.COMPANY_LOGO_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15'));
    process.env.COMPANY_LOGO_URL = 'https://example.com/logo.png';
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env.COMPANY_LOGO_URL = originalCompanyLogoUrl;
  });

  describe('renderOwnerNotification', () => {
    it('returns the rendered notification template mapped from the contact', () => {
      mockGenerateHtmlTemplate.mockReturnValue('<html>Rendered</html>');
      const sut = new HandlebarsEmailTemplateRenderer();
      const contact = createContact();

      const result = sut.renderOwnerNotification(contact);

      expect(result).toBe('<html>Rendered</html>');
      expect(mockGenerateHtmlTemplate).toHaveBeenCalledTimes(1);
      const [filePath, templateContext] = mockGenerateHtmlTemplate.mock
        .calls[0] as [string, Record<string, unknown>];
      expect(filePath).toBe(
        path.join(
          process.cwd(),
          'app',
          '_mail-templates',
          'contact-notification.hbs'
        )
      );
      expect(templateContext).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
        year: '2024',
        companyLogoUrl: 'https://example.com/logo.png',
      });
    });

    it('throws RepositoryError when generateHtmlTemplate fails', () => {
      const originalError = new Error('Template file not found');
      mockGenerateHtmlTemplate.mockImplementation(() => {
        throw originalError;
      });
      const sut = new HandlebarsEmailTemplateRenderer();
      const contact = createContact();

      expect(() => sut.renderOwnerNotification(contact)).toThrow(
        RepositoryError
      );
      expect(() => sut.renderOwnerNotification(contact)).toThrow(
        'Failed to render email template'
      );
      expect(() => sut.renderOwnerNotification(contact)).toThrow(
        expect.objectContaining({ cause: originalError })
      );
    });
  });

  describe('renderVisitorConfirmation', () => {
    it('returns the rendered confirmation template without the message', () => {
      mockGenerateHtmlTemplate.mockReturnValue('<html>Rendered</html>');
      const sut = new HandlebarsEmailTemplateRenderer();
      const contact = createContact();

      const result = sut.renderVisitorConfirmation(contact);

      expect(result).toBe('<html>Rendered</html>');
      expect(mockGenerateHtmlTemplate).toHaveBeenCalledTimes(1);
      const [filePath, templateContext] = mockGenerateHtmlTemplate.mock
        .calls[0] as [string, Record<string, unknown>];
      expect(filePath).toBe(
        path.join(process.cwd(), 'app', '_mail-templates', 'contact.hbs')
      );
      expect(templateContext).toEqual({
        name: 'John Doe',
        year: '2024',
        companyLogoUrl: 'https://example.com/logo.png',
      });
    });

    it('throws RepositoryError when generateHtmlTemplate fails', () => {
      const originalError = new Error('Template file not found');
      mockGenerateHtmlTemplate.mockImplementation(() => {
        throw originalError;
      });
      const sut = new HandlebarsEmailTemplateRenderer();
      const contact = createContact();

      expect(() => sut.renderVisitorConfirmation(contact)).toThrow(
        RepositoryError
      );
      expect(() => sut.renderVisitorConfirmation(contact)).toThrow(
        'Failed to render email template'
      );
      expect(() => sut.renderVisitorConfirmation(contact)).toThrow(
        expect.objectContaining({ cause: originalError })
      );
    });
  });
});
