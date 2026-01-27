import { AffiliateId, type AffiliateRepository } from '../../../domain';
import { type AffiliateOutput, toAffiliateOutput } from '../../shared';

export interface FetchAffiliatesByIdsInput {
  ids: readonly string[];
}

export interface FetchAffiliatesByIdsOutput {
  affiliates: Map<string, AffiliateOutput>;
}

/**
 * FetchAffiliatesByIds Use Case
 *
 * Fetches multiple affiliates by their IDs in a single batch operation.
 * This is more efficient than fetching each affiliate individually.
 */
export class FetchAffiliatesByIds {
  constructor(private readonly affiliateRepository: AffiliateRepository) {}

  async execute(
    input: FetchAffiliatesByIdsInput
  ): Promise<FetchAffiliatesByIdsOutput> {
    if (input.ids.length === 0) {
      return { affiliates: new Map() };
    }

    const affiliateIds = input.ids.map((id) => AffiliateId.create(id));
    const affiliatesMap = await this.affiliateRepository.findByIds(affiliateIds);

    const outputMap = new Map<string, AffiliateOutput>();
    affiliatesMap.forEach((affiliate, id) => {
      outputMap.set(id, toAffiliateOutput(affiliate));
    });

    return { affiliates: outputMap };
  }
}
