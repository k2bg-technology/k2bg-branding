import type pino from 'pino';
import { Writable } from 'stream';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { lines } = vi.hoisted(() => ({ lines: [] as string[] }));

vi.mock('pino', async (importOriginal) => {
  const actual = await importOriginal<{ default: typeof pino }>();

  return {
    ...actual,
    default: (options: pino.LoggerOptions) =>
      actual.default(
        options,
        new Writable({
          write(chunk, _encoding, callback) {
            lines.push(chunk.toString().trim());
            callback();
          },
        })
      ),
  };
});

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('LOG_LEVEL', 'info');
  lines.length = 0;
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('logger', () => {
  it('defaults to info level when LOG_LEVEL is not set', async () => {
    vi.stubEnv('LOG_LEVEL', undefined);

    const { logger: sut } = await import('./index');

    expect(sut.level).toBe('info');
  });

  it('respects LOG_LEVEL environment variable', async () => {
    vi.stubEnv('LOG_LEVEL', 'debug');

    const { logger: sut } = await import('./index');

    expect(sut.level).toBe('debug');
  });

  it.each([
    {
      field: 'email',
      payload: { email: 'user@example.com' },
      expected: { email: '[REDACTED]' },
    },
    {
      field: 'password',
      payload: { password: 'secret123' },
      expected: { password: '[REDACTED]' },
    },
    {
      field: 'nested token',
      payload: { auth: { token: 'abc-123-xyz' } },
      expected: { auth: { token: '[REDACTED]' } },
    },
    {
      field: 'nested API key',
      payload: { service: { apiKey: 'key-456' } },
      expected: { service: { apiKey: '[REDACTED]' } },
    },
  ])('redacts the $field from emitted JSON', async ({ payload, expected }) => {
    const { logger: sut } = await import('./index');

    sut.info(payload, 'request processed');

    expect(JSON.parse(lines[0])).toMatchObject(expected);
  });

  it('preserves non-sensitive fields in structured JSON', async () => {
    const { logger: sut } = await import('./index');

    sut.info({ username: 'john', action: 'login' }, 'request processed');

    expect(JSON.parse(lines[0])).toMatchObject({
      username: 'john',
      action: 'login',
      msg: 'request processed',
      level: 30,
      time: expect.any(Number),
    });
  });

  it('includes module context and redacts sensitive fields in child output', async () => {
    const { logger } = await import('./index');
    const sut = logger.child({ module: 'post' });

    sut.info({ email: 'user@example.com' }, 'child log message');

    expect(JSON.parse(lines[0])).toMatchObject({
      module: 'post',
      email: '[REDACTED]',
      msg: 'child log message',
    });
  });

  it('preserves parent bindings in nested child output', async () => {
    const { logger } = await import('./index');
    const childLogger = logger.child({ module: 'contact' });
    const sut = childLogger.child({ operation: 'send-email' });

    sut.info('nested child message');

    expect(JSON.parse(lines[0])).toMatchObject({
      module: 'contact',
      operation: 'send-email',
      msg: 'nested child message',
    });
  });
});
