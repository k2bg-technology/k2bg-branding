import { createMiddleware } from 'hono/factory';
import { logger } from '../../modules/shared/logger';

const apiLogger = logger.child({ module: 'api' });

export const requestLogger = createMiddleware(async (c, next) => {
  const { method } = c.req;
  const path = c.req.path;

  apiLogger.info({ method, path }, 'Request started');

  const start = Date.now();
  await next();
  const duration = Date.now() - start;

  const status = c.res.status;
  apiLogger.info({ method, path, status, duration }, 'Request completed');
});
