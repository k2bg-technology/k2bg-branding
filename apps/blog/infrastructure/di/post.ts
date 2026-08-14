import { getDrizzleClient } from '../drizzle';
import { getNotionClient, getNotionToMarkdown } from '../notion';
import { CloudinaryOgImageUrlGenerator, getCloudinary } from '../cloudinary';
import {
  CloudinaryImageRepository,
  NotionExternalImageSource,
  NotionExternalPostSource,
  DrizzleFetchAllSlugsQueryService,
  DrizzleFetchPostQueryService,
  DrizzleFetchPostSummariesByCategoryQueryService,
  DrizzleFetchPostSummariesQueryService,
  DrizzlePostBatchRepository,
  DrizzleSearchPostSummariesQueryService,
} from '../../modules/post/adapters/output';
import { postLogger } from '../../modules/post/adapters/shared';
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
  const db = getDrizzleClient();
  return new FetchPostSummaries(
    new DrizzleFetchPostSummariesQueryService(db)
  );
}

export function createFetchPostUseCase(): FetchPost {
  const db = getDrizzleClient();
  return new FetchPost(
    new DrizzleFetchPostQueryService(db),
    new CloudinaryOgImageUrlGenerator()
  );
}

export function getDefaultOgImageUrl(): string {
  const generator = new CloudinaryOgImageUrlGenerator();
  return generator.generate(process.env.DEFAULT_OG_IMAGE_PUBLIC_ID ?? '');
}

export function createFetchAllSlugsUseCase(): FetchAllSlugs {
  const db = getDrizzleClient();
  return new FetchAllSlugs(new DrizzleFetchAllSlugsQueryService(db));
}

export function createFetchPostSummariesByCategoryUseCase(): FetchPostSummariesByCategory {
  const db = getDrizzleClient();
  return new FetchPostSummariesByCategory(
    new DrizzleFetchPostSummariesByCategoryQueryService(db)
  );
}

export function createSearchPostSummariesUseCase(): SearchPostSummaries {
  const db = getDrizzleClient();
  return new SearchPostSummaries(
    new DrizzleSearchPostSummariesQueryService(db)
  );
}

export function createSyncPostsFromExternalUseCase(): SyncPostsFromExternal {
  const db = getDrizzleClient();
  const notionClient = getNotionClient();
  const n2m = getNotionToMarkdown();

  return new SyncPostsFromExternal(
    new NotionExternalPostSource(notionClient, n2m),
    new DrizzlePostBatchRepository(db)
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
    new CloudinaryImageRepository(cloudinary),
    postLogger
  );
}
