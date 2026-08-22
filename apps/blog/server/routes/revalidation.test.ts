import { Hono } from 'hono';
import { revalidatePath, revalidateTag } from 'next/cache';
import { describe, expect, it, vi } from 'vitest';
import { errorHandler } from '../middleware/errorHandler';
import { revalidationRoutes } from './revalidation';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('logger', () => ({
  logger: {
    child: () => ({ error: vi.fn(), info: vi.fn() }),
  },
}));

const mockRevalidatePath = vi.mocked(revalidatePath);
const mockRevalidateTag = vi.mocked(revalidateTag);

function createApp() {
  const app = new Hono();
  app.route('/', revalidationRoutes);
  app.onError(errorHandler);
  return app;
}

function postRevalidate(app: Hono, body?: Record<string, string>) {
  return app.request('/revalidate', {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('revalidationRoutes', () => {
  describe('POST /revalidate', () => {
    it('revalidates all blog pages and returns revalidated true when no body is given', async () => {
      mockRevalidatePath.mockClear();
      const app = createApp();

      const res = await postRevalidate(app);

      const statusOk = 200;
      expect(res.status).toBe(statusOk);
      const body = await res.json();
      expect(body.revalidated).toBe(true);
    });

    it('returns 500 with the shared error shape when revalidation fails', async () => {
      mockRevalidatePath.mockImplementationOnce(() => {
        throw new Error('Revalidation failed');
      });
      const app = createApp();

      const res = await postRevalidate(app);

      const statusInternalError = 500;
      expect(res.status).toBe(statusInternalError);
      const body = await res.json();
      expect(body.error).toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
        status: statusInternalError,
      });
    });

    it('revalidates by tag when a tag is given', async () => {
      mockRevalidateTag.mockClear();
      const app = createApp();
      const tag = 'posts';

      const res = await postRevalidate(app, { tag });

      const statusOk = 200;
      expect(res.status).toBe(statusOk);
      expect(mockRevalidateTag).toHaveBeenCalledWith(tag, 'max');
    });

    it('revalidates a specific path when a path is given', async () => {
      mockRevalidatePath.mockClear();
      const app = createApp();
      const path = '/blog/my-post';

      const res = await postRevalidate(app, { path });

      const statusOk = 200;
      expect(res.status).toBe(statusOk);
      expect(mockRevalidatePath).toHaveBeenCalledWith(path);
    });

    it('returns 500 when revalidating a specific path fails', async () => {
      mockRevalidatePath.mockImplementationOnce(() => {
        throw new Error('Revalidation failed');
      });
      const app = createApp();

      const res = await postRevalidate(app, { path: '/blog/my-post' });

      const statusInternalError = 500;
      expect(res.status).toBe(statusInternalError);
    });
  });
});
