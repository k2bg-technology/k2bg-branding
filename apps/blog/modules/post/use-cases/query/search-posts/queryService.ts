import type { Post } from '../../../domain';
import type { AuthorOutput, SortOrder } from '../../shared';

export interface SearchPostsParams {
  query: string;
  page: number;
  pageSize: number;
  orderBy: SortOrder;
}

export interface PostWithAuthor {
  post: Post;
  author: AuthorOutput | null;
}

export interface SearchPostsResult {
  posts: PostWithAuthor[];
  totalCount: number;
}

/**
 * Query service interface for searching posts
 */
export interface SearchPostsQueryService {
  searchPosts(params: SearchPostsParams): Promise<SearchPostsResult>;
}
