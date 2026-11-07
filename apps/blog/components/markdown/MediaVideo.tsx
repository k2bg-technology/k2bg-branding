import { EmbeddedVideoPlayer, VideoPlayer } from 'ui';

import type { MediaOutput } from '../../modules/media/use-cases';

interface Props {
  media: MediaOutput;
}

export function MediaVideo({ media }: Props) {
  if (media.width == null || media.height == null) {
    return null;
  }

  if (media.sourceFile) {
    return (
      <VideoPlayer
        id={media.id}
        file={media.sourceFile}
        width={media.width}
        height={media.height}
      />
    );
  }

  if (media.sourceUrl) {
    return (
      <EmbeddedVideoPlayer
        id={media.id}
        url={media.sourceUrl}
        width={media.width}
        height={media.height}
      />
    );
  }

  return null;
}
