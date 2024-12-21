import { VideoFilePlayer, VideoStreamingPlayer } from 'ui';

import { type MediaVideo } from '../../modules/interfaces/media/validator';

interface MediaVideoProps {
  mediaVideo: MediaVideo;
}

export function MediaVideo(props: MediaVideoProps) {
  const { mediaVideo } = props;

  if (mediaVideo.sourceFile) {
    return (
      <div className="flex justify-center mt-8">
        <VideoFilePlayer
          id={mediaVideo.id}
          file={mediaVideo.sourceFile}
          width={mediaVideo.width}
          height={mediaVideo.height}
        />
      </div>
    );
  }

  if (mediaVideo.sourceUrl) {
    return (
      <div className="flex justify-center mt-8">
        <VideoStreamingPlayer
          id={mediaVideo.id}
          url={mediaVideo.sourceUrl}
          width={mediaVideo.width}
          height={mediaVideo.height}
        />
      </div>
    );
  }

  return null;
}
