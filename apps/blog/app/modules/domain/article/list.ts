import { Single } from './single';
import { ArticleData, ArticleList } from './interfaces';

export class List implements ArticleList {
  private articles: Single[];

  constructor(dataList: ArticleData[]) {
    this.articles = dataList.map((data) => new Single(data));
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
      if (!a.releaseDate || !b.releaseDate) return 0;

      const dateA = new Date(a.releaseDate);
      const dateB = new Date(b.releaseDate);

      return dateB.getTime() - dateA.getTime();
    });
  }
}
