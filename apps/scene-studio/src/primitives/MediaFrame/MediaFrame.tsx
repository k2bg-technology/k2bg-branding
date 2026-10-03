import { AbsoluteFill, Img, OffthreadVideo, staticFile } from 'remotion';

import { cn } from '../../utils/cn';
import { isSelfContainedSource } from './isSelfContainedSource';

interface Props {
  src: string;
  mediaType: 'image' | 'video';
  fit?: 'cover' | 'contain';
  transform?: string;
  startFromInFrames?: number;
  muted?: boolean;
  className?: string;
}

export function MediaFrame({
  src,
  mediaType,
  fit = 'cover',
  transform,
  startFromInFrames,
  muted = true,
  className,
}: Props) {
  const resolvedSource = isSelfContainedSource(src) ? src : staticFile(src);
  const mediaStyle = {
    width: '100%',
    height: '100%',
    objectFit: fit,
    transform,
  } as const;

  return (
    <AbsoluteFill className={cn('overflow-hidden', className)}>
      {mediaType === 'image' ? (
        <Img src={resolvedSource} style={mediaStyle} />
      ) : (
        <OffthreadVideo
          src={resolvedSource}
          style={mediaStyle}
          startFrom={startFromInFrames}
          muted={muted}
        />
      )}
    </AbsoluteFill>
  );
}
