import { getPrismaClient } from '../prisma';
import { getNotionClient, getNotionToMarkdown } from '../notion';
import { CloudinaryOgImageUrlGenerator, getCloudinary } from '../cloudinary';
import {
  CloudinaryImageRepository,
  NotionExternalImageSource,
  NotionExternalPostSource,
  PrismaFetchAllSlugsQueryService,
  PrismaFetchPostQueryService,
  PrismaFetchPostSummariesByCategoryQueryService,
  PrismaFetchPostSummariesQueryService,
  PrismaPostBatchRepository,
  PrismaSearchPostSummariesQueryService,
} from '../../modules/post/adapters/output';
import { NotionMediaExternalImageSource } from '../../modules/media/adapters/output';
import { NotionAffiliateExternalImageSource } from '../../modules/affiliate/adapters/output';
import { FetchAllSlugs } from '../../modules/post/use-cases/query/fetch-all-slugs';
import { FetchPost } from '../../modules/post/use-cases/query/fetch-post';
import { FetchPostSummaries } from '../../modules/post/use-cases/query/fetch-post-summaries';
import { FetchPostSummariesByCategory } from '../../modules/post/use-cases/query/fetch-post-summaries-by-category';
import { SearchPostSummaries } from '../../modules/post/use-cases/query/search-post-summaries';
import { SyncPostsFromExternal } from '../../modules/post/use-cases/sync/sync-posts-from-external';
import { SyncHeroImages } from '../../modules/post/use-cases/sync/sync-hero-images';

export function createFetchPostSummariesUseCase(): FetchPostSummaries {
  const prisma = getPrismaClient();
  return new FetchPostSummaries(
    new PrismaFetchPostSummariesQueryService(prisma)
  );
}

export function createFetchPostUseCase(): FetchPost {
  const prisma = getPrismaClient();
  return new FetchPost(
    new PrismaFetchPostQueryService(prisma),
    new CloudinaryOgImageUrlGenerator()
  );
}

export function getDefaultOgImageUrl(): string {
  const generator = new CloudinaryOgImageUrlGenerator();
  return generator.generate(process.env.DEFAULT_OG_IMAGE_PUBLIC_ID ?? '');
}

export function createFetchAllSlugsUseCase(): FetchAllSlugs {
  const prisma = getPrismaClient();
  return new FetchAllSlugs(new PrismaFetchAllSlugsQueryService(prisma));
}

export function createFetchPostSummariesByCategoryUseCase(): FetchPostSummariesByCategory {
  const prisma = getPrismaClient();
  return new FetchPostSummariesByCategory(
    new PrismaFetchPostSummariesByCategoryQueryService(prisma)
  );
}

export function createSearchPostSummariesUseCase(): SearchPostSummaries {
  const prisma = getPrismaClient();
  return new SearchPostSummaries(
    new PrismaSearchPostSummariesQueryService(prisma)
  );
}

export function createSyncPostsFromExternalUseCase(): SyncPostsFromExternal {
  const prisma = getPrismaClient();
  const notionClient = getNotionClient();
  const n2m = getNotionToMarkdown();

  return new SyncPostsFromExternal(
    new NotionExternalPostSource(notionClient, n2m),
    new PrismaPostBatchRepository(prisma)
  );
}

export function createSyncHeroImagesUseCase(): SyncHeroImages {
  const notionClient = getNotionClient();
  const cloudinary = getCloudinary();

  return new SyncHeroImages(
    [
      new NotionExternalImageSource(notionClient),
      new NotionMediaExternalImageSource(notionClient),
      new NotionAffiliateExternalImageSource(notionClient),
    ],
    new CloudinaryImageRepository(cloudinary)
  );
}
