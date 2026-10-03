export interface Logger {
  error(context: Record<string, unknown>, message: string): void;
}
