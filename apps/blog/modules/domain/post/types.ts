import { Author } from '../author/types';

export const Type = {
  ARTICLE: 'ARTICLE',
  PAGE: 'PAGE',
} as const;
export type Type = (typeof Type)[keyof typeof Type];

export const Status = {
  IDEA: 'IDEA',
  DRAFT: 'DRAFT',
  PREVIEW: 'PREVIEW',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type Status = (typeof Status)[keyof typeof Status];

export const Category = {
  ENGINEERING: 'ENGINEERING',
  DESIGN: 'DESIGN',
  DATA_SCIENCE: 'DATA_SCIENCE',
  LIFE_STYLE: 'LIFE_STYLE',
  OTHER: 'OTHER',
} as const;
export type Category = (typeof Category)[keyof typeof Category];

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
