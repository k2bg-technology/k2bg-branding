import { revalidatePath } from 'next/cache';
import { describe, expect, it, vi } from 'vitest';
import { revalidateBlogPages, revalidateBlogPath } from './revalidation';

const { errorMock } = vi.hoisted(() => ({
  errorMock: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('logger', () => ({
  logger: {
    child: () => ({ error: errorMock, info: vi.fn() }),
  },
}));

const mockRevalidatePath = vi.mocked(revalidatePath);

describe('revalidateBlogPages', () => {
  it('revalidates every blog page path', () => {
    mockRevalidatePath.mockClear();

    revalidateBlogPages();

    const blogPageCount = 4;
    expect(mockRevalidatePath).toHaveBeenCalledTimes(blogPageCount);
  });

  it('logs and rethrows when revalidatePath fails', () => {
    errorMock.mockClear();
    const revalidationError = new Error('Revalidation failed');
    mockRevalidatePath.mockImplementationOnce(() => {
      throw revalidationError;
    });

    expect(() => revalidateBlogPages()).toThrow(revalidationError);
    expect(errorMock).toHaveBeenCalledOnce();
  });
});

describe('revalidateBlogPath', () => {
  it('revalidates the given path', () => {
    mockRevalidatePath.mockClear();
    const path = '/blog/my-post';

    revalidateBlogPath(path);

    expect(mockRevalidatePath).toHaveBeenCalledWith(path);
  });

  it('logs and rethrows when revalidatePath fails', () => {
    errorMock.mockClear();
    const revalidationError = new Error('Revalidation failed');
    mockRevalidatePath.mockImplementationOnce(() => {
      throw revalidationError;
    });

    expect(() => revalidateBlogPath('/blog/my-post')).toThrow(
      revalidationError
    );
    expect(errorMock).toHaveBeenCalledOnce();
  });
});
