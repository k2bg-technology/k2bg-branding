import type { Client } from '@notionhq/client';

export type ElementType<T> = T extends (infer U)[] ? U : never;
export type MatchType<T, U, V = never> = T extends U ? T : V;

export type PageObject = MatchType<
  ElementType<Awaited<ReturnType<Client['databases']['query']>>['results']>,
  {
    properties: unknown;
  }
>;
