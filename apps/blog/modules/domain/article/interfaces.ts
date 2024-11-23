export interface ArticleCore {
  title?: string;
  excerpt?: string;
  image?: string;
  imagePlaceholder?: Promise<string>;
  slug?: string;
  status?: string;
  date?: string;
  author?: Author;
  category?: string;
}

export interface ArticleSingle extends ArticleCore {}

export interface ArticleList {
  all: ArticleSingle[];
}

export interface ArticleData {
  id: string;
  getTitle: (propertyName: string) => string | undefined;
  getRichText: (propertyName: string) => string | undefined;
  getSelect: (propertyName: string) => string | undefined;
  getDate: (propertyName: string) => string | undefined;
  getFiles: (propertyName: string) => string[] | undefined;
  getStatus: (propertyName: string) => string | undefined;
  getPerson: (propertyName: string) => Author | undefined;
  getCreatedTime: (propertyName: string) => string | undefined;
}

interface Author {
  name: string | null;
  avatar_url: string | null;
}
