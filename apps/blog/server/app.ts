import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { apiKeyAuth } from './middleware/apiKeyAuth';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { mediaRoutes, postRoutes } from './routes';

const app = new OpenAPIHono().basePath('/api');

app.openAPIRegistry.registerComponent('securitySchemes', 'ApiKeyAuth', {
  type: 'apiKey',
  in: 'header',
  name: 'x-api-key',
});

app.use('*', requestLogger);
app.use('/posts', apiKeyAuth);
app.use('/images', apiKeyAuth);

app.route('/', postRoutes);
app.route('/', mediaRoutes);

if (process.env.NODE_ENV !== 'production') {
  app.doc('/doc.json', {
    openapi: '3.1.0',
    info: { title: 'K2BG Blog API', version: '1.0.0' },
    security: [{ ApiKeyAuth: [] }],
  });

  app.get('/doc', swaggerUI({ url: '/api/doc.json' }));
}

app.onError(errorHandler);

export { app };
