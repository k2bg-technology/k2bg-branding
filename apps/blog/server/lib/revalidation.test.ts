import { revalidatePath } from 'next/cache';
import { describe, expect, it, vi } from 'vitest';
import { revalidateBlogPages, revalidateBlogPath } from './revalidation';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('logger', () => ({
  logger: {
    child: () => ({ error: vi.fn(), info: vi.fn() }),
  },
}));

const mockRevalidatePath = vi.mocked(revalidatePath);

describe('revalidateBlogPages', () => {
  it('revalidates every blog page path', () => {
    mockRevalidatePath.mockClear();

    revalidateBlogPages();

    expect(mockRevalidatePath.mock.calls).toEqual([
      ['/blog', 'page'],
      ['/blog/[id]/[slug]', 'page'],
      ['/category/[category]', 'page'],
      ['/concept', 'page'],
    ]);
  });

  it('rethrows when revalidatePath fails', () => {
    const revalidationError = new Error('Revalidation failed');
    mockRevalidatePath.mockImplementationOnce(() => {
      throw revalidationError;
    });

    expect(() => revalidateBlogPages()).toThrow(revalidationError);
  });
});

describe('revalidateBlogPath', () => {
  it('revalidates the given path', () => {
    mockRevalidatePath.mockClear();
    const path = '/blog/my-post';

    revalidateBlogPath(path);

    expect(mockRevalidatePath).toHaveBeenCalledWith(path);
  });

  it('rethrows when revalidatePath fails', () => {
    const revalidationError = new Error('Revalidation failed');
    mockRevalidatePath.mockImplementationOnce(() => {
      throw revalidationError;
    });

    expect(() => revalidateBlogPath('/blog/my-post')).toThrow(
      revalidationError
    );
  });
});
