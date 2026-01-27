import { getNotionClient } from '../notion';
import { NotionMediaRepository } from '../../modules/media/adapters';
import { FetchMedia } from '../../modules/media/use-cases';

export function createFetchMediaUseCase(): FetchMedia {
  const notionClient = getNotionClient();
  return new FetchMedia(new NotionMediaRepository(notionClient));
}
