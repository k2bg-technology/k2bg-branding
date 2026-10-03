import type { Post, PostId } from '../../../domain';
import type { AuthorOutput } from '../../shared';

export interface PostWithAuthor {
  post: Post;
  author: AuthorOutput | null;
}

export interface FetchPostQueryService {
  fetchPost(id: PostId): Promise<PostWithAuthor | null>;
}
