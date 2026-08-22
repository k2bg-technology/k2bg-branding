import { createFetchMediaUseCase } from '../../infrastructure/di/media';
import { mediaLogger } from '../../modules/media/adapters/shared/logger';
import { MediaType } from '../../modules/media/domain';
import { MediaImage } from './MediaImage';
import { MediaVideo } from './MediaVideo';

interface MediaEmbProps {
  id: string;
}

export async function MediaEmb(props: MediaEmbProps) {
  const { id } = props;

  const fetchMedia = createFetchMediaUseCase();
  const result = await fetchMedia.execute({ id }).catch((error) => {
    mediaLogger.error({ err: error, id }, 'Failed to fetch media embed');
    return null;
  });

  if (result === null) {
    return null;
  }

  const { media } = result;

  return (
    <div className="flex justify-center mt-4">
      {(() => {
        switch (media.type) {
          case MediaType.IMAGE:
            return <MediaImage media={media} />;
          case MediaType.VIDEO:
            return <MediaVideo media={media} />;
          default:
            return null;
        }
      })()}
    </div>
  );
}
