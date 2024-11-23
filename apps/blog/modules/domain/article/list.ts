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

  private sortByDate() {
    return this.articles.sort((a, b) => {
      if (!a.releaseDate || !b.releaseDate) return 0;

      const dateA = new Date(a.releaseDate);
      const dateB = new Date(b.releaseDate);

      return dateB.getTime() - dateA.getTime();
    });
  }
}
