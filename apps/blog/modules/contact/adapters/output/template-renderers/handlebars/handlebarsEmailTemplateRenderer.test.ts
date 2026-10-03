import handlebars from 'handlebars';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Contact } from '../../../../domain';
import { RepositoryError } from '../../../shared';
import { HandlebarsEmailTemplateRenderer } from './handlebarsEmailTemplateRenderer';

const { mockGenerateHtmlTemplate } = vi.hoisted(() => ({
  mockGenerateHtmlTemplate:
    vi.fn<(filePath: string, context: Record<string, unknown>) => string>(),
}));

vi.mock('../../../shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../shared')>();
  return {
    ...actual,
    generateHtmlTemplate: mockGenerateHtmlTemplate,
  };
});

function createContact() {
  return Contact.create({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Test message',
  });
}

describe('HandlebarsEmailTemplateRenderer', () => {
  const originalCompanyLogoUrl = process.env.COMPANY_LOGO_URL;
  const notificationTemplatePath = path.join(
    process.cwd(),
    'app',
    '_mail-templates',
    'contact-notification.hbs'
  );
  const confirmationTemplatePath = path.join(
    process.cwd(),
    'app',
    '_mail-templates',
    'contact.hbs'
  );

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
      const templates = new Map([
        [
          notificationTemplatePath,
          '<h1>{{name}}</h1><p>{{email}}</p><p>{{message}}</p><img src="{{companyLogoUrl}}"><footer>{{year}}</footer>',
        ],
      ]);
      mockGenerateHtmlTemplate.mockImplementation((filePath, context) =>
        handlebars.compile(templates.get(filePath) ?? '')(context)
      );
      const sut = new HandlebarsEmailTemplateRenderer();
      const contact = createContact();

      const result = sut.renderOwnerNotification(contact);

      expect(result).toBe(
        '<h1>John Doe</h1><p>john@example.com</p><p>Test message</p><img src="https://example.com/logo.png"><footer>2024</footer>'
      );
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
      const templates = new Map([
        [
          confirmationTemplatePath,
          '<h1>{{name}}</h1><p>{{message}}</p><img src="{{companyLogoUrl}}"><footer>{{year}}</footer>',
        ],
      ]);
      mockGenerateHtmlTemplate.mockImplementation((filePath, context) =>
        handlebars.compile(templates.get(filePath) ?? '')(context)
      );
      const sut = new HandlebarsEmailTemplateRenderer();
      const contact = createContact();

      const result = sut.renderVisitorConfirmation(contact);

      expect(result).toBe(
        '<h1>John Doe</h1><p></p><img src="https://example.com/logo.png"><footer>2024</footer>'
      );
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
