import { Page } from '../notion/notionPage';

import { Article } from './article';

export class Articles {
  articles: Article[];

  constructor(pages: Page[]) {
    this.articles = pages.map((page) => new Article(page));
    this.articles = this.sortByDate();
  }

  get all() {
    return this.articles;
  }

  get featureLatest() {
    return this.articles?.[0];
  }

  get featuresRecently() {
    return this.articles.slice(1, 3);
  }

  get featuresPreviously() {
    return this.articles.slice(4, 8);
  }

  private sortByDate() {
    return this.articles.sort((a, b) => {
      if (!a.date || !b.date) return 0;

      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      return dateB.getTime() - dateA.getTime();
    });
  }
}
