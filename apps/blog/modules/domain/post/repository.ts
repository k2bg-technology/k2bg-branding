import type { Category, Order, Post } from './types';

export interface InputRepository {
  getAllPosts: (orderBy?: Order) => Promise<Post[]>;
  getAllHeroImageSources: () => Promise<
    {
      id: string;
      url: string;
    }[]
  >;
}

export interface OutputRepository {
  getAllArticles: (orderBy?: Order) => Promise<Post[]>;
  getAllArticleSlugs: (orderBy?: Order) => Promise<Pick<Post, 'id' | 'slug'>[]>;
  getArticlesCountByCategory: (category: Category) => Promise<number>;
  getPaginatedArticlesByCategory: (
    category: Category,
    pageSize: number,
    currentPage: number,
    orderBy: Order
  ) => Promise<Post[]>;
  getArticlesCountByQueryString: (queryString: string) => Promise<number>;
  getPaginatedArticlesByQueryString: (
    queryString: string,
    pageSize: number,
    currentPage: number,
    orderBy: Order
  ) => Promise<Post[]>;
  getPost: (id: Post['id']) => Promise<Post>;
  upsertAllPosts: (posts: Post[]) => Promise<void>;
}
