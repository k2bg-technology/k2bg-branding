import VideoFilePlayer from 'ui/src/components/Media/VideoFilePlayer';
import VideoStreamingPlayer from 'ui/src/components/Media/VideoStreamingPlayer';
import type { MediaOutput } from '../../modules/media/use-cases';

interface MediaVideoProps {
  media: MediaOutput;
}

export function MediaVideo({ media }: MediaVideoProps) {
  if (media.width == null || media.height == null) {
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

  return null;
}
