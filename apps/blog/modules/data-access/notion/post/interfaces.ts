export interface PostCore {
  title?: string;
  type?: string;
  excerpt?: string;
  image?: string;
  slug?: string;
  status?: string;
  date?: string;
  author?: Author;
  category?: string;
}

export interface PostSingle extends PostCore {}

interface Author {
  id: string;
  name?: string;
  avatarUrl?: string;
}
