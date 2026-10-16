import { isFullPage } from '@notionhq/client';
import type {
  PageObjectResponse,
  QueryDataSourceResponse,
} from '@notionhq/client/build/src/api-endpoints';

type QueryDataSourceResult = QueryDataSourceResponse['results'][number];

export function isFullPageObjectResponse(
  result: QueryDataSourceResult
): result is PageObjectResponse {
  return isFullPage(result);
}

export function filterFullPageObjectResponses(
  results: QueryDataSourceResponse['results']
): PageObjectResponse[] {
  return results.filter(isFullPageObjectResponse);
}
