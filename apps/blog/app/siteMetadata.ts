import { Category } from '../modules/post/domain';

export const BLOG_SITE_NAME = 'K2.B.G Technology Blog';

export const BLOG_SITE_DESCRIPTION =
  'エンジニアでなくてもテクノロジーを活用できる —— そんな情報を発信するブログです。非IT出身からエンジニアへ転身した筆者が、プログラミング・AI・自動化・UI/UXなど幅広いテーマを、わかりやすく解説します。';

export const BLOG_THEME_COLOR = '#111827';

export const LISTED_CATEGORIES = [
  Category.ENGINEERING,
  Category.DESIGN,
  Category.DATA_SCIENCE,
  Category.LIFE_STYLE,
] as const;

export type ListedCategory = (typeof LISTED_CATEGORIES)[number];

export function isListedCategory(value: string): value is ListedCategory {
  return LISTED_CATEGORIES.some((category) => category === value);
}

export const BLOG_CATEGORY_DESCRIPTIONS: Record<ListedCategory, string> = {
  [Category.ENGINEERING]:
    'プログラミングやソフトウェア設計、開発ツール、自動化の記事をまとめたカテゴリです。非IT出身からエンジニアへ転身した筆者が、専門用語に頼らず、基礎から実践までわかりやすく解説します。',
  [Category.DESIGN]:
    'UI/UX やデザインシステム、人間中心設計の記事をまとめたカテゴリです。エンジニアの視点から、使いやすいプロダクトをどう考え、どう形にするかを、基礎から実践までわかりやすく解説します。',
  [Category.DATA_SCIENCE]:
    'データ分析や可視化、データにもとづく意思決定の記事をまとめたカテゴリです。集めたデータをどう整理し、どう読み解いて判断につなげるかを、業務で使える形でわかりやすく解説します。',
  [Category.LIFE_STYLE]:
    '暮らしや働き方にテクノロジーを取り入れる記事をまとめたカテゴリです。日常を仕組み化して自由な時間を増やす考え方や工夫を、筆者自身の経験にもとづいて紹介します。',
};

export function getBlogSiteBaseUrl(): string {
  return process.env.BLOG_SITE_BASE_URL || 'http://localhost:3000';
}
