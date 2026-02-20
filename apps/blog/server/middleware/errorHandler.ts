import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { logger } from '../../modules/shared/logger';

const apiLogger = logger.child({ module: 'api' });

/**
 * Maps HTTP status codes to standardized error codes.
 * Uses Partial<Record> to leverage Hono's type system while allowing subset of codes.
 */
const HTTP_STATUS_CODES: Partial<Record<ContentfulStatusCode, string>> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  405: 'METHOD_NOT_ALLOWED',
  408: 'REQUEST_TIMEOUT',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_SERVER_ERROR',
  502: 'BAD_GATEWAY',
  503: 'SERVICE_UNAVAILABLE',
};

export const errorHandler: ErrorHandler = (err, c) => {
  const isHttpException = err instanceof HTTPException;
  const status = isHttpException ? err.status : 500;
  const message = isHttpException ? err.message : 'Internal Server Error';
  const code = HTTP_STATUS_CODES[status] ?? 'INTERNAL_SERVER_ERROR';

  apiLogger.error(
    { err, status, errorName: err.name, path: c.req.path },
    message,
  );

  return c.json(
    {
      error: {
        code,
        message,
        status,
        timestamp: new Date().toISOString(),
      },
    },
    status,
  );
};
