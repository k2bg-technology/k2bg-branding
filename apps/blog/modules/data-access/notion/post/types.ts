export interface Post {
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

interface Author {
  id: string;
  name?: string;
  avatarUrl?: string;
}
