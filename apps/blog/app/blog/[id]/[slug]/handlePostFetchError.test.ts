import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PostNotFoundError,
  UseCaseError,
} from '../../../../modules/post/use-cases/shared';
import { handlePostFetchError } from './handlePostFetchError';

const { mockNotFound, mockWarn, mockError } = vi.hoisted(() => ({
  mockNotFound: vi.fn(),
  mockWarn: vi.fn(),
  mockError: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  notFound: mockNotFound,
}));

vi.mock('../../../../modules/post/adapters/shared/logger', () => ({
  postLogger: { warn: mockWarn, error: mockError },
}));

describe('handlePostFetchError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs a warning and calls notFound when the error is a UseCaseError', () => {
    const postId = 'post-123';
    const useCaseError = new PostNotFoundError(postId);

    handlePostFetchError(useCaseError, postId);

    expect(mockWarn).toHaveBeenCalledWith(
      { err: useCaseError, id: postId },
      'Post not found'
    );
    expect(mockError).not.toHaveBeenCalled();
    expect(mockNotFound).toHaveBeenCalledTimes(1);
  });

  it('treats a bare UseCaseError as an expected not-found', () => {
    const postId = 'post-123';
    const useCaseError = new UseCaseError('boom');

    handlePostFetchError(useCaseError, postId);

    expect(mockWarn).toHaveBeenCalledTimes(1);
    expect(mockError).not.toHaveBeenCalled();
  });

  it('logs an error and calls notFound when the error is unexpected', () => {
    const postId = 'post-123';
    const unexpectedError = new Error('Database connection refused');

    handlePostFetchError(unexpectedError, postId);

    expect(mockError).toHaveBeenCalledWith(
      { err: unexpectedError, id: postId },
      'Failed to fetch post'
    );
    expect(mockWarn).not.toHaveBeenCalled();
    expect(mockNotFound).toHaveBeenCalledTimes(1);
  });
});
