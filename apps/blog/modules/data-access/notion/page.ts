import type { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

import type { MatchType, PageObject } from './types';

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

  public getTitle(propertyName: string) {
    return this.getPageProperty(propertyName, 'title')
      ?.title.map((title) => title.plain_text)
      .join(' ');
  }

  public getRichText(propertyName: string) {
    return this.getPageProperty(propertyName, 'rich_text')
      ?.rich_text.map((text) => text.plain_text)
      .join(' ');
  }

  public getUrl(propertyName: string) {
    const url = this.getPageProperty(propertyName, 'url')?.url;

    return typeof url === 'string' ? url : undefined;
  }

  public getNumber(propertyName: string) {
    const number = this.getPageProperty(propertyName, 'number')?.number;

    return typeof number === 'number' ? number : undefined;
  }

  public getSelect(propertyName: string) {
    const select = this.getPageProperty(propertyName, 'select')?.select;

    return select instanceof Object && 'name' in select
      ? select.name
      : undefined;
  }

  public getStatus(propertyName: string) {
    const status = this.getPageProperty(propertyName, 'status')?.status;

    return status instanceof Object && 'name' in status
      ? status.name
      : undefined;
  }

  public getDate(propertyName: string) {
    const date = this.getPageProperty(propertyName, 'date')?.date;

    return date instanceof Object ? date.start : undefined;
  }

  public getPerson(propertyName: string) {
    const people = this.getPageProperty(propertyName, 'people')?.people;

    return Array.isArray(people) && 'person' in people[0]
      ? people[0]
      : undefined;
  }

  public getRelations(propertyName: string) {
    const relations = this.getPageProperty(propertyName, 'relation')?.relation;

    return (
      (Array.isArray(relations) && relations.map((relation) => relation.id)) ||
      []
    );
  }

  public getFiles(propertyName: string) {
    return this.getPageProperty(propertyName, 'files')?.files.reduce(
      (files, file) => ('file' in file ? [...files, file.file.url] : files),
      [] as string[]
    );
  }

  public getCreatedTime(propertyName: string) {
    const created_time = this.getPageProperty(
      propertyName,
      'created_time'
    )?.created_time;

    return typeof created_time === 'string' ? created_time : undefined;
  }

  public getDataType() {
    return this.getSelect('type');
  }

  private getPageProperty<
    T extends string,
    U extends PageObject['properties'][T]['type'],
  >(propertyName: T, type: U) {
    return this.pagePropertyMap.get(
      this.result.properties[propertyName].id,
      type
    );
  }

  static isPageObject(
    result: QueryDatabaseResponse['results'][number]
  ): result is PageObject {
    return 'properties' in result;
  }

  static matchPropertyType<
    PropType extends string,
    Prop extends { type: string },
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
