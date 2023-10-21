import { Client } from '@notionhq/client';

export type ElementType<T> = T extends (infer U)[] ? U : never;
export type MatchType<T, U, V = never> = T extends U ? T : V;

export type PageObject = MatchType<
  ElementType<Awaited<ReturnType<Client['databases']['query']>>['results']>,
  {
    properties: unknown;
  }
>;

export interface PostResponse {
  id: string;
  author: string;
  excerpt: string;
  status: string;
  type: string;
  mineType: string;
  date: string;
  modified: string;
  slug: string;
}

// type PropertiesConverter<T extends { type: PropertyKey }> = {
//   [U in T as U['type']]: U['type'] extends keyof U ? U : never;
// };

// type Author = PropertiesConverter<
//   // DatabaseObjectResponse['properties'][string]
//   PageObjectResponse['properties'][string]
// >['people'];
