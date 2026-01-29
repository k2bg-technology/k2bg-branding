import VideoFilePlayer from 'ui/src/components/Media/VideoFilePlayer';
import VideoStreamingPlayer from 'ui/src/components/Media/VideoStreamingPlayer';
import { createFetchMediaUseCase } from '../../infrastructure';
import { MediaType } from '../../modules/media/domain';
import type { MediaOutput } from '../../modules/media/use-cases';
import { CloudinaryImage } from '../cloudinary-image/CloudinaryImage';

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
  if (!media.effectiveSource || media.width === null || media.height === null) {
    return null;
  }

  if (media.targetUrl)
    return (
      <a
        href={media.targetUrl}
        target="_blank"
        rel="noopener nofollow"
        className="inline-block"
      >
        <CloudinaryImage
          publicId={media.id}
          src={media.effectiveSource}
          alt={media.name}
          width={media.width}
          height={media.height}
          unoptimized={media.extension === '.gif'}
        />
      </a>
    );

  return (
    <CloudinaryImage
      publicId={media.id}
      src={media.effectiveSource}
      alt={media.name}
      width={media.width}
      height={media.height}
      unoptimized={media.extension === '.gif'}
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
