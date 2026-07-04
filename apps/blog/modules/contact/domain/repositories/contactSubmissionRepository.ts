/**
 * ContactSubmissionRepository Interface
 *
 * Defines the contract for contact form submission tracking.
 * This interface is part of the domain layer and should be
 * implemented by adapters in the infrastructure layer.
 */
export interface ContactSubmissionRepository {
  /**
   * Count submissions for an IP hash since the given timestamp.
   */
  countSince(ipHash: string, since: Date): Promise<number>;

  /**
   * Record a contact form submission for an IP hash.
   */
  record(ipHash: string): Promise<void>;
}
