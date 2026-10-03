import { notFound } from 'next/navigation';
import { postLogger } from '../../../../modules/post/adapters/shared/logger';
import { UseCaseError } from '../../../../modules/post/use-cases/shared';

/**
 * Discriminates a post fetch failure before falling back to `notFound()`:
 * a `UseCaseError` (e.g. the post genuinely does not exist) is an expected
 * application outcome and logs as a warning, while any other error is an
 * unexpected infrastructure/mapping failure and logs as an error so an outage
 * is never masked as a silent 404.
 *
 * @see .claude/rules/error-handling-guidelines.md (Next.js Page Boundary)
 */
export function handlePostFetchError(error: unknown, id: string): never {
  if (error instanceof UseCaseError) {
    postLogger.warn({ err: error, id }, 'Post not found');
  } else {
    postLogger.error({ err: error, id }, 'Failed to fetch post');
  }

  notFound();
}
