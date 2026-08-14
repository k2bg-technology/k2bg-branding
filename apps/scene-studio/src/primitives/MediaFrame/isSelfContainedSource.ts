/**
 * Sources that need no staticFile() resolution: absolute URLs and data URIs.
 * Everything else is treated as a path inside public/.
 */
export function isSelfContainedSource(src: string): boolean {
  return /^(https?:|data:)/.test(src);
}
