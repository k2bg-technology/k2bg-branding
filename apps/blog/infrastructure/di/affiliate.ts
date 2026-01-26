import { getNotionClient } from '../notion';
import { NotionAffiliateRepository } from '../../modules/affiliate/adapters/output';
import { FetchAffiliate } from '../../modules/affiliate/use-cases/query';

export function createFetchAffiliateUseCase(): FetchAffiliate {
  const notionClient = getNotionClient();
  return new FetchAffiliate(new NotionAffiliateRepository(notionClient));
}
