/**
 * Port for recording use-case events without depending on a logging implementation.
 */
export interface Logger {
  error(context: Record<string, unknown>, message: string): void;
}
