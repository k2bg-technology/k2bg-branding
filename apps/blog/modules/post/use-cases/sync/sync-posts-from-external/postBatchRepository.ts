import type { Post } from '../../../domain';
import type { AuthorRecord } from './authorRecord';

export interface PostBatchRepository {
  upsertAll(posts: Post[], authorRecords: AuthorRecord[]): Promise<void>;
}
