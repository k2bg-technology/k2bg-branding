import type { Category, Post } from '../../../domain';
import type { AuthorOutput, SortOrder } from '../../shared';

export interface FetchPostsByCategoryParams {
  category: Category;
  page: number;
  pageSize: number;
  orderBy: SortOrder;
}

export interface PostWithAuthor {
  post: Post;
  author: AuthorOutput | null;
}

export interface FetchPostsByCategoryResult {
  posts: PostWithAuthor[];
  totalCount: number;
}

/**
 * Query service interface for fetching posts by category
 */
export interface FetchPostsByCategoryQueryService {
  fetchPostsByCategory(
    params: FetchPostsByCategoryParams
  ): Promise<FetchPostsByCategoryResult>;
}
