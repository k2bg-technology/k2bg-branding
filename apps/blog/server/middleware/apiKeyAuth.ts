import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

export const apiKeyAuth = createMiddleware(async (c, next) => {
  const apiKey = c.req.header('x-api-key');
  if (apiKey !== process.env.API_KEY) {
    throw new HTTPException(401, { message: 'Invalid or missing API key' });
  }
  await next();
});
