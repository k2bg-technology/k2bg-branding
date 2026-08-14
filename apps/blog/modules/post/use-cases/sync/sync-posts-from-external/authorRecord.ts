/**
 * Author data extracted from the external source alongside posts.
 *
 * Produced only when the source supplies a full person object with a name;
 * partial persons yield no record so existing rows are preserved.
 */
export interface AuthorRecord {
  id: string;
  name: string;
  avatarUrl: string | null;
}
