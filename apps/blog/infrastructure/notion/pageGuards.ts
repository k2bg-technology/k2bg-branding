import { isFullPage } from '@notionhq/client';
import type {
  PageObjectResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints';

type QueryDatabaseResult = QueryDatabaseResponse['results'][number];

export function isFullPageObjectResponse(
  result: QueryDatabaseResult
): result is PageObjectResponse {
  return isFullPage(result);
}

export function filterFullPageObjectResponses(
  results: QueryDatabaseResponse['results']
): PageObjectResponse[] {
  return results.filter(isFullPageObjectResponse);
}
