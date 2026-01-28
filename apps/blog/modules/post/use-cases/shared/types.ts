import type { Category } from '../../domain';

/**
 * Pagination input parameters
 */
export interface PaginationInput {
  page: number;
  pageSize: number;
}

/**
 * Sorting order
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Author output type
 */
export interface AuthorOutput {
  id: string;
  name: string;
  avatarUrl: string | null;
}

/**
 * Common output type for post data
 */
export interface PostOutput {
  id: string;
  title: string;
  content: string;
  type: string;
  excerpt: string | null;
  imageUrl: string;
  slug: string;
  status: string;
  category: Category;
  tags: readonly string[];
  authorId: string;
  author: AuthorOutput | null;
  releaseDate: string;
  revisionDate: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Slug output for SSG
 */
export interface SlugOutput {
  id: string;
  slug: string;
}
