import type { EmailSender } from '../../../domain';

/**
 * EmailSender interface for SendEmail use case
 *
 * Re-exports the domain interface for use in the use case layer.
 * This enables dependency injection and testability.
 */
export type { EmailSender };
