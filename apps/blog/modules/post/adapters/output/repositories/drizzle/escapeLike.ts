// Escapes characters that PostgreSQL LIKE/ILIKE treats as wildcards so user
// input matches as a literal substring (parity with Prisma's `contains`).
// Backslash must be replaced first via the single regex; otherwise the
// escapes inserted for % and _ would themselves be re-escaped.
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}
