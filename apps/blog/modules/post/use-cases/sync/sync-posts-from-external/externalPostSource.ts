import type { Post } from '../../../domain';
import type { AuthorRecord } from './authorRecord';

export interface ExternalPostBatch {
  posts: Post[];
  authors: AuthorRecord[];
}

export interface ExternalPostSource {
  fetchAll(): Promise<ExternalPostBatch>;
}
