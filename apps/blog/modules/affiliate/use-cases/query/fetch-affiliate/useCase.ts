import { AffiliateId, type AffiliateRepository } from '../../../domain';
import {
  AffiliateNotFoundError,
  type AffiliateOutput,
  toAffiliateOutput,
} from '../../shared';

export interface FetchAffiliateInput {
  id: string;
}

export interface FetchAffiliateOutput {
  affiliate: AffiliateOutput;
}

/**
 * FetchAffiliate Use Case
 *
 * Fetches a single affiliate by its ID.
 */
export class FetchAffiliate {
  constructor(private readonly affiliateRepository: AffiliateRepository) {}

  async execute(input: FetchAffiliateInput): Promise<FetchAffiliateOutput> {
    const affiliateId = AffiliateId.create(input.id);
    const affiliate = await this.affiliateRepository.findById(affiliateId);

    if (!affiliate) {
      throw new AffiliateNotFoundError(input.id);
    }

    return {
      affiliate: toAffiliateOutput(affiliate),
    };
  }
}
