import { Author } from '../author/types';

export const Type = ['article', 'page'] as const;
export type Type = (typeof Type)[number];

export const Status = [
  'idea',
  'draft',
  'preview',
  'published',
  'archived',
] as const;
export type Status = (typeof Status)[number];

export const Category = [
  'engineering',
  'design',
  'data-science',
  'life-style',
  'other',
] as const;
export type Category = (typeof Category)[number];

export interface Post {
  id: string;
  title: string;
  content: string;
  type: Type;
  excerpt: string;
  imageUrl: string;
  slug: string;
  status: Status;
  category: Category;
  tags: string[];
  author: Author;
  releaseDate: string;
  revisionDate: string;
}

export type Order = 'asc' | 'desc';
