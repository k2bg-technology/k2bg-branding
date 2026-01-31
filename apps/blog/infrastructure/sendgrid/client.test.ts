import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  configureSendGrid,
  getSendGridEmailSender,
  resetSendGridConfig,
} from './client';

vi.mock('../../modules/contact/adapters', () => ({
  SendGridEmailSender: vi.fn().mockImplementation((apiKey, senderEmail) => ({
    apiKey,
    senderEmail,
    send: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe('sendgrid/client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    resetSendGridConfig();
    process.env = {
      ...originalEnv,
      SEND_GRID_API_KEY: 'test-api-key',
      SEND_GRID_SINGLE_SENDER_DOMAIN: 'test@example.com',
    };
  });

  afterEach(() => {
    resetSendGridConfig();
    process.env = originalEnv;
  });

  describe('configureSendGrid', () => {
    it('configures SendGrid with environment variables', () => {
      const emailSender = getSendGridEmailSender();

      expect(emailSender).toBeDefined();
    });

    it('accepts custom configuration', () => {
      configureSendGrid({
        apiKey: 'custom-api-key',
        senderEmail: 'custom@example.com',
      });

      const emailSender = getSendGridEmailSender();

      expect(emailSender).toBeDefined();
    });
  });

  describe('getSendGridEmailSender', () => {
    it('returns a SendGridEmailSender instance', () => {
      const emailSender = getSendGridEmailSender();

      expect(emailSender).toBeDefined();
    });

    it('auto-configures on first call', () => {
      const emailSender = getSendGridEmailSender();

      expect(emailSender).toBeDefined();
    });

    it('returns the same instance on subsequent calls', () => {
      const firstInstance = getSendGridEmailSender();
      const secondInstance = getSendGridEmailSender();

      expect(firstInstance).toBe(secondInstance);
    });

    it('creates a new instance after reset', () => {
      const firstInstance = getSendGridEmailSender();
      resetSendGridConfig();
      const secondInstance = getSendGridEmailSender();

      expect(firstInstance).not.toBe(secondInstance);
    });
  });

  describe('resetSendGridConfig', () => {
    it('clears the current configuration', () => {
      getSendGridEmailSender();
      resetSendGridConfig();
      const newInstance = getSendGridEmailSender();

      expect(newInstance).toBeDefined();
    });
  });
});
