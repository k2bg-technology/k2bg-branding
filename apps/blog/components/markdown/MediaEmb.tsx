import ImageViewer from 'ui/src/components/Media/ImageViewer';
import VideoFilePlayer from 'ui/src/components/Media/VideoFilePlayer';
import VideoStreamingPlayer from 'ui/src/components/Media/VideoStreamingPlayer';
import { createFetchMediaUseCase } from '../../infrastructure';
import { MediaType } from '../../modules/media/domain';
import type { MediaOutput } from '../../modules/media/use-cases';

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
            return <ImageContent media={media} />;
          case MediaType.VIDEO:
            return <VideoContent media={media} />;
          default:
            return null;
        }
      })()}
    </div>
  );
}

function ImageContent({ media }: { media: MediaOutput }) {
  if (media.width === null || media.height === null) return null;

  return (
    <ImageViewer
      id={media.id}
      name={media.name}
      url={media.sourceUrl ?? undefined}
      file={media.sourceFile ?? undefined}
      width={media.width}
      height={media.height}
      unoptoinized={media.extension === '.gif'}
    />
  );
}

function VideoContent({ media }: { media: MediaOutput }) {
  if (media.width === null || media.height === null) {
    return null;
  }

  if (media.sourceFile) {
    return (
      <VideoFilePlayer
        id={media.id}
        file={media.sourceFile}
        width={media.width}
        height={media.height}
      />
    );
  }

  if (media.sourceUrl) {
    return (
      <VideoStreamingPlayer
        id={media.id}
        url={media.sourceUrl}
        width={media.width}
        height={media.height}
      />
    );
  }
}
