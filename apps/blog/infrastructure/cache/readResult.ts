// Five-minute expiry keeps fallbacks prerenderable without retaining outages for an hour.
export const RECOVERABLE_FAILURE_CACHE_LIFE = {
  stale: 300,
  revalidate: 60,
  expire: 300,
} as const;

interface SerializedCacheError {
  name: string;
  message: string;
  stack?: string;
  cause?: SerializedCacheError;
}

export type CachedReadResult<Output> =
  | { data: Output }
  | { error: SerializedCacheError };

export function serializeCacheError(error: unknown): SerializedCacheError {
  if (!(error instanceof Error)) {
    return { name: 'Error', message: String(error) };
  }

  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...('cause' in error && error.cause !== undefined
      ? { cause: serializeCacheError(error.cause) }
      : {}),
  };
}

export function restoreCacheError(error: SerializedCacheError): Error {
  const restored = new Error(error.message);
  restored.name = error.name;
  restored.stack = error.stack;
  if (error.cause) {
    Object.defineProperty(restored, 'cause', {
      value: restoreCacheError(error.cause),
      configurable: true,
      writable: true,
    });
  }
  return restored;
}
