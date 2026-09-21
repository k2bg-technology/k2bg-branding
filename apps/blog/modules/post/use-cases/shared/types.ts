import type { Category } from '../../domain';

export interface PaginationInput {
  page: number;
  pageSize: number;
}

export type SortOrder = 'asc' | 'desc';

export interface AuthorOutput {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface PostOutput {
  id: string;
  title: string;
  content: string;
  type: string;
  excerpt: string | null;
  imageUrl: string;
  ogImageUrl: string | null;
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

export interface PostSummaryOutput {
  id: string;
  title: string;
  excerpt: string | null;
  imageUrl: string;
  slug: string;
  category: Category;
  author: AuthorOutput | null;
  releaseDate: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SlugOutput {
  id: string;
  slug: string;
  revisionDate: string;
}
