import { createFetchMediaUseCase } from '../../infrastructure';
import { MediaType } from '../../modules/media/domain';
import { MediaImage } from './MediaImage';
import { MediaVideo } from './MediaVideo';

interface MediaEmbProps {
  id: string;
}

export async function MediaEmb(props: MediaEmbProps) {
  const { id } = props;

  const fetchMedia = createFetchMediaUseCase();
  const { media } = await fetchMedia.execute({ id });

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
