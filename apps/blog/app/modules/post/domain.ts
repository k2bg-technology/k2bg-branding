import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

import { MatchType, PageObject } from './type';

export function isPageObject(
  result: QueryDatabaseResponse['results'][number]
): result is PageObject {
  return 'properties' in result;
}

function matchPropertyType<
  PropType extends string,
  Prop extends { type: string }
>(
  property: Prop,
  type: PropType
): property is MatchType<Prop, { type: PropType }> {
  return property.type === type;
}

export function createPagePropertyMap(page: PageObject) {
  const properties = Object.fromEntries<PageObject['properties'][string]>(
    Object.values(page.properties).map((prop) => [prop.id, prop])
  );
  return {
    get<PropType extends string>(id: string, type: PropType) {
      const prop = properties[id];
      if (!prop || !matchPropertyType(prop, type)) {
        return null;
      }
      return prop;
    },
  } as const;
}
