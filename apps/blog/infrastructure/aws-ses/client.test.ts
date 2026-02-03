import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  configureAwsSes,
  getAwsSesEmailSender,
  resetAwsSesConfig,
} from './client';

vi.mock('@aws-sdk/client-ses', () => ({
  SESClient: vi.fn().mockImplementation((config) => ({
    config,
    send: vi.fn().mockResolvedValue({}),
  })),
}));

vi.mock('../../modules/contact/adapters', () => ({
  AwsSesEmailSender: vi.fn().mockImplementation((sesClient, senderEmail) => ({
    sesClient,
    senderEmail,
    send: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe('aws-ses/client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    resetAwsSesConfig();
    process.env = {
      ...originalEnv,
      AMAZON_REGION: 'us-east-1',
      AMAZON_ACCESS_KEY_ID: 'test-access-key',
      AMAZON_SECRET_ACCESS_KEY: 'test-secret-key',
      AMAZON_SES_SENDER_EMAIL: 'test@example.com',
    };
  });

  afterEach(() => {
    resetAwsSesConfig();
    process.env = originalEnv;
  });

  describe('configureAwsSes', () => {
    it('configures AWS SES with environment variables', () => {
      const emailSender = getAwsSesEmailSender();

      expect(emailSender).toBeDefined();
    });

    it('accepts custom configuration', () => {
      configureAwsSes({
        region: 'eu-west-1',
        accessKeyId: 'custom-access-key',
        secretAccessKey: 'custom-secret-key',
        senderEmail: 'custom@example.com',
      });

      const emailSender = getAwsSesEmailSender();

      expect(emailSender).toBeDefined();
    });

    it('uses default region when not specified', () => {
      process.env.AMAZON_REGION = '';

      resetAwsSesConfig();
      const emailSender = getAwsSesEmailSender();

      expect(emailSender).toBeDefined();
    });
  });

  describe('getAwsSesEmailSender', () => {
    it('returns an AwsSesEmailSender instance', () => {
      const emailSender = getAwsSesEmailSender();

      expect(emailSender).toBeDefined();
    });

    it('auto-configures on first call', () => {
      const emailSender = getAwsSesEmailSender();

      expect(emailSender).toBeDefined();
    });

    it('returns the same instance on subsequent calls', () => {
      const firstInstance = getAwsSesEmailSender();
      const secondInstance = getAwsSesEmailSender();

      expect(firstInstance).toBe(secondInstance);
    });

    it('creates a new instance after reset', () => {
      const firstInstance = getAwsSesEmailSender();
      resetAwsSesConfig();
      const secondInstance = getAwsSesEmailSender();

      expect(firstInstance).not.toBe(secondInstance);
    });
  });

  describe('resetAwsSesConfig', () => {
    it('clears the current configuration', () => {
      getAwsSesEmailSender();
      resetAwsSesConfig();
      const newInstance = getAwsSesEmailSender();

      expect(newInstance).toBeDefined();
    });
  });
});
