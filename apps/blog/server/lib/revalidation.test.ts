import { revalidateTag } from 'next/cache';
import { describe, expect, it, vi } from 'vitest';
import { revalidateBlogPages, revalidateBlogPath } from './revalidation';

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}));

vi.mock('logger', () => ({
  logger: {
    child: () => ({ error: vi.fn(), info: vi.fn() }),
  },
}));

const mockRevalidateTag = vi.mocked(revalidateTag);

describe('revalidateBlogPages', () => {
  it('marks all blog data stale with stale-while-revalidate', () => {
    mockRevalidateTag.mockClear();

    revalidateBlogPages();

    expect(mockRevalidateTag.mock.calls).toEqual([['blog', 'max']]);
  });

  it('rethrows when revalidateTag fails', () => {
    const revalidationError = new Error('Revalidation failed');
    mockRevalidateTag.mockImplementationOnce(() => {
      throw revalidationError;
    });

    expect(() => revalidateBlogPages()).toThrow(revalidationError);
  });
});

describe('revalidateBlogPath', () => {
  it('revalidates the given path', () => {
    mockRevalidateTag.mockClear();
    const path = '/blog/my-post';

    revalidateBlogPath(path);

    expect(mockRevalidateTag.mock.calls).toEqual([
      [path, 'max'],
      ['blog', 'max'],
    ]);
  });

  it('rethrows when revalidateTag fails', () => {
    const revalidationError = new Error('Revalidation failed');
    mockRevalidateTag.mockImplementationOnce(() => {
      throw revalidationError;
    });

    expect(() => revalidateBlogPath('/blog/my-post')).toThrow(
      revalidationError
    );
  });
});
