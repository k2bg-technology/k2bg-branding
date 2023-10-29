import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

import { MatchType, PageObject } from './type';

export class Article {
  result: PageObject;

  pagePropertyMap: ReturnType<typeof Article.createPagePropertyMap>;

  constructor(result: QueryDatabaseResponse['results'][number]) {
    if (Article.isPageObject(result)) {
      this.result = result;
      this.pagePropertyMap = Article.createPagePropertyMap(result);
    } else {
      throw new Error('Post must be a page object');
    }
  }

  get title() {
    const titleObject = this.pagePropertyMap.get(
      this.result.properties.content.id,
      'title'
    );

    return titleObject?.title.map((title) => title.plain_text).join(' ');
  }

  get excerpt() {
    const excerptObject = this.pagePropertyMap.get(
      this.result.properties.excerpt.id,
      'rich_text'
    );

    return excerptObject?.rich_text.map((text) => text.plain_text).join(' ');
  }

  get image() {
    const imageObject = this.pagePropertyMap.get(
      this.result.properties.image.id,
      'files'
    );

    return imageObject?.files
      .flatMap((file) => ('file' in file ? file.file.url : []))
      .join(' ');
  }

  get slug() {
    const slugObject = this.pagePropertyMap.get(
      this.result.properties.slug.id,
      'rich_text'
    );
    const slug = slugObject?.rich_text.map((text) => text.plain_text).join(' ');
    const params = new URLSearchParams({
      id: this.result.id,
    });

    return slug ? `${slug}?${params}` : undefined;
  }

  get status() {
    const statusObject = this.pagePropertyMap.get(
      this.result.properties.status.id,
      'status'
    );

    return statusObject?.status && 'name' in statusObject.status
      ? statusObject.status.name
      : undefined;
  }

  get date() {
    const dateObject = this.pagePropertyMap.get(
      this.result.properties.date.id,
      'created_time'
    );

    return typeof dateObject?.created_time === 'string'
      ? dateObject.created_time
      : undefined;
  }

  static isPageObject(
    result: QueryDatabaseResponse['results'][number]
  ): result is PageObject {
    return 'properties' in result;
  }

  static matchPropertyType<
    PropType extends string,
    Prop extends { type: string }
  >(
    property: Prop,
    type: PropType
  ): property is MatchType<Prop, { type: PropType }> {
    return property.type === type;
  }

  static createPagePropertyMap(page: PageObject) {
    const properties = Object.fromEntries<PageObject['properties'][string]>(
      Object.values(page.properties).map((prop) => [prop.id, prop])
    );
    return {
      get<PropType extends string>(id: string, type: PropType) {
        const prop = properties[id];
        if (!prop || !Article.matchPropertyType(prop, type)) {
          return null;
        }
        return prop;
      },
    } as const;
  }
}
