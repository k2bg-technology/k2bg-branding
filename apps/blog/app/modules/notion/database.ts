import { Page } from './page';
import { Core } from './core';

export class Database extends Core {
  public async getPages() {
    const database = await this.fetchDatabase();

    return database.results.map((result) => new Page(result));
  }
}
