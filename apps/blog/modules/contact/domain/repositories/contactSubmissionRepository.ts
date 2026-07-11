/**
 * ContactSubmissionRepository Interface
 *
 * Defines the contract for contact form submission tracking.
 * This interface is part of the domain layer and should be
 * implemented by adapters in the infrastructure layer.
 */
export interface ContactSubmissionRepository {
  /**
   * Atomically record a submission for an IP hash unless it already has
   * `maxSubmissions` submissions since the given timestamp. Returns `true`
   * when the submission was recorded, `false` when the limit was reached
   * (in which case nothing is recorded). Implementations must guard the
   * check-and-insert against concurrent submissions from the same IP hash.
   */
  recordIfUnderLimit(
    ipHash: string,
    since: Date,
    maxSubmissions: number
  ): Promise<boolean>;
}
