export interface ArticleCore {
  title: string | undefined;
  excerpt: string | undefined;
  image: string | undefined;
  slug: string | undefined;
  status: string | undefined;
  date: string | undefined;
  author: Author | undefined;
  category: string | undefined;
}

export interface ArticleSingle extends ArticleCore {}

export interface ArticleList {
  all: ArticleSingle[];
  featureLatest: ArticleSingle | undefined;
  featuresRecently: ArticleSingle[];
  featuresPreviously: ArticleSingle[];
}

export interface ArticleData {
  id: string;
  getTitle: (propertyName: string) => string | undefined;
  getRichText: (propertyName: string) => string | undefined;
  getSelect: (propertyName: string) => string | undefined;
  getFiles: (propertyName: string) => string[] | undefined;
  getStatus: (propertyName: string) => string | undefined;
  getCreatedTime: (propertyName: string) => string | undefined;
  getPerson: (propertyName: string) => Author | undefined;
}

interface Author {
  name: string | null;
  avatar_url: string | null;
}
