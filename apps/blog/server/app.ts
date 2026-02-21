import { Hono } from 'hono';
import { apiKeyAuth } from './middleware/apiKeyAuth';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { mediaRoutes, postRoutes } from './routes';

const app = new Hono().basePath('/api');

app.use('*', requestLogger);
app.use('*', apiKeyAuth);
app.route('/', postRoutes);
app.route('/', mediaRoutes);
app.onError(errorHandler);

export default app;
