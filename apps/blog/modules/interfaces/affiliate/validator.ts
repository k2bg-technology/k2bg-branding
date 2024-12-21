import { z } from 'zod';

const affiliateSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  targetUrl: z.string(),
  provider: z.string(),
});

export const affiliateTextSchema = affiliateSchema;

export type AffiliateText = z.infer<typeof affiliateTextSchema>;

export const affiliateBannerSchema = affiliateSchema.extend({
  imageSourceUrl: z.string(),
  imageWidth: z.number(),
  imageHeight: z.number(),
});

export type AffiliateBanner = z.infer<typeof affiliateBannerSchema>;

export const affiliateProductSchema = affiliateSchema.extend({
  providerColor: z.string(),
  subProviders: z.string().array(),
  imageProvider: z.string(),
  imageSourceUrl: z.string(),
  imageWidth: z.number(),
  imageHeight: z.number(),
});

export type AffiliateProduct = z.infer<typeof affiliateProductSchema>;

export const affiliateSubProviderSchema = affiliateSchema.extend({
  providerColor: z.string(),
});

export type AffiliateSubProvider = z.infer<typeof affiliateSubProviderSchema>;
