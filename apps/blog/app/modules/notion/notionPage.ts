import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

import { MatchType, PageObject } from './type';

export class Page {
  result: PageObject;

  pagePropertyMap: ReturnType<typeof Page.createPagePropertyMap>;

  constructor(result: QueryDatabaseResponse['results'][number]) {
    if (Page.isPageObject(result)) {
      this.result = result;
      this.pagePropertyMap = Page.createPagePropertyMap(result);
    } else {
      throw new Error('Post must be a page object');
    }
  }

  get id() {
    return this.result.id;
  }

  get title() {
    return this.pagePropertyMap.get(this.result.properties.content.id, 'title');
  }

  get excerpt() {
    return this.pagePropertyMap.get(
      this.result.properties.excerpt.id,
      'rich_text'
    );
  }

  get image() {
    return this.pagePropertyMap.get(this.result.properties.image.id, 'files');
  }

  get slug() {
    return this.pagePropertyMap.get(
      this.result.properties.slug.id,
      'rich_text'
    );
  }

  get status() {
    return this.pagePropertyMap.get(this.result.properties.status.id, 'status');
  }

  get date() {
    return this.pagePropertyMap.get(
      this.result.properties.date.id,
      'created_time'
    );
  }

  get author() {
    return this.pagePropertyMap.get(this.result.properties.author.id, 'people');
  }

  get category() {
    return this.pagePropertyMap.get(
      this.result.properties.category.id,
      'select'
    );
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
        if (!prop || !Page.matchPropertyType(prop, type)) {
          return null;
        }
        return prop;
      },
    } as const;
  }
}
