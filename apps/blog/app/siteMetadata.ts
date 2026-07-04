export const blogSiteName = 'K2.B.G Technology Blog';

export const blogSiteDescription =
  'エンジニアでなくてもテクノロジーを活用できる —— そんな情報を発信するブログです。非IT出身からエンジニアへ転身した筆者が、プログラミング・AI・自動化・UI/UXなど幅広いテーマを、わかりやすく解説します。';

export const blogThemeColor = '#111827';

export function getBlogSiteBaseUrl(): string {
  return process.env.BLOG_SITE_BASE_URL || 'http://localhost:3000';
}
