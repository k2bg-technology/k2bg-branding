import pino from 'pino';
import { Writable } from 'stream';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function createSinkLogger(
  options: pino.LoggerOptions,
  onData: (line: string) => void
) {
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      onData(chunk.toString().trim());
      callback();
    },
  });
  return pino(options, stream);
}

describe('logger', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('is a valid pino instance', async () => {
    delete process.env.LOG_LEVEL;

    const { logger } = await import('./logger');

    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.child).toBe('function');
  });

  it('defaults to info level when LOG_LEVEL is not set', async () => {
    delete process.env.LOG_LEVEL;

    const { logger } = await import('./logger');

    expect(logger.level).toBe('info');
  });

  it('respects LOG_LEVEL environment variable', async () => {
    process.env.LOG_LEVEL = 'debug';

    const { logger } = await import('./logger');

    expect(logger.level).toBe('debug');
  });

  describe('redaction', () => {
    const redactConfig: pino.LoggerOptions = {
      level: 'info',
      redact: {
        paths: ['email', 'password', '*.token', '*.apiKey'],
        censor: '[REDACTED]',
      },
    };

    it('redacts email field', () => {
      const lines: string[] = [];
      const sut = createSinkLogger(redactConfig, (line) => lines.push(line));

      sut.info({ email: 'user@example.com' }, 'test message');

      const output = JSON.parse(lines[0]);
      expect(output.email).toBe('[REDACTED]');
    });

    it('redacts password field', () => {
      const lines: string[] = [];
      const sut = createSinkLogger(redactConfig, (line) => lines.push(line));

      sut.info({ password: 'secret123' }, 'test message');

      const output = JSON.parse(lines[0]);
      expect(output.password).toBe('[REDACTED]');
    });

    it('redacts nested token fields', () => {
      const lines: string[] = [];
      const sut = createSinkLogger(redactConfig, (line) => lines.push(line));

      sut.info({ auth: { token: 'abc-123-xyz' } }, 'test message');

      const output = JSON.parse(lines[0]);
      expect(output.auth.token).toBe('[REDACTED]');
    });

    it('redacts nested apiKey fields', () => {
      const lines: string[] = [];
      const sut = createSinkLogger(redactConfig, (line) => lines.push(line));

      sut.info({ service: { apiKey: 'key-456' } }, 'test message');

      const output = JSON.parse(lines[0]);
      expect(output.service.apiKey).toBe('[REDACTED]');
    });

    it('does not redact non-sensitive fields', () => {
      const lines: string[] = [];
      const sut = createSinkLogger(redactConfig, (line) => lines.push(line));

      sut.info({ username: 'john', action: 'login' }, 'test message');

      const output = JSON.parse(lines[0]);
      expect(output.username).toBe('john');
      expect(output.action).toBe('login');
    });
  });

  describe('child logger', () => {
    it('includes module context in output', () => {
      const lines: string[] = [];
      const parentLogger = createSinkLogger({ level: 'info' }, (line) =>
        lines.push(line)
      );
      const childLogger = parentLogger.child({ module: 'post' });

      childLogger.info('child log message');

      const output = JSON.parse(lines[0]);
      expect(output.module).toBe('post');
      expect(output.msg).toBe('child log message');
    });

    it('preserves parent logger bindings in child', () => {
      const lines: string[] = [];
      const parentLogger = createSinkLogger({ level: 'info' }, (line) =>
        lines.push(line)
      );
      const childLogger = parentLogger.child({ module: 'contact' });
      const grandchildLogger = childLogger.child({ operation: 'send-email' });

      grandchildLogger.info('nested child message');

      const output = JSON.parse(lines[0]);
      expect(output.module).toBe('contact');
      expect(output.operation).toBe('send-email');
    });
  });

  describe('JSON output', () => {
    it('produces valid structured JSON in production mode', () => {
      const lines: string[] = [];
      const sut = createSinkLogger({ level: 'info' }, (line) =>
        lines.push(line)
      );

      sut.info({ requestId: '123' }, 'request processed');

      expect(() => JSON.parse(lines[0])).not.toThrow();
      const output = JSON.parse(lines[0]);
      expect(output.msg).toBe('request processed');
      expect(output.requestId).toBe('123');
      expect(output.level).toBe(30);
      expect(output.time).toBeDefined();
    });
  });
});
