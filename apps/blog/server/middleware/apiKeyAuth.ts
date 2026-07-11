import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

export const apiKeyAuth = createMiddleware(async (c, next) => {
  const configuredApiKey = process.env.API_KEY;
  if (!configuredApiKey) {
    throw new HTTPException(500, {
      message: 'API authentication is not configured',
    });
  }

  const apiKey = c.req.header('x-api-key');
  if (apiKey !== configuredApiKey) {
    throw new HTTPException(401, { message: 'Invalid or missing API key' });
  }
  await next();
});
