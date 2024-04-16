import { GetPlaiceholderReturn } from 'plaiceholder';
import { Single } from './single';
import { ArticleData, ArticleList } from './interfaces';
import { convertImageExternalToLocal } from '../../utility/convertImageExternalToLocal';

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

  async convertImageExternalToLocal() {
    Promise.all(
      this.all.map(
        (article) =>
          article.image &&
          convertImageExternalToLocal(
            article.image,
            `/images/${article.id}.jpg`
          )
      )
    );
  }

  static async convertImageToPlaceholder(
    articles: Single[]
  ): Promise<Record<Single['id'], GetPlaiceholderReturn>> {
    return articles.reduce(async (prev, article) => {
      const placeholder = await article.imagePlaceholder;

      return { ...(await prev), [article.id]: placeholder };
    }, {});
  }
}
