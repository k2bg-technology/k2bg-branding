import { AbsoluteFill, Img, OffthreadVideo, staticFile } from 'remotion';

import { cn } from '../../utils/cn';

interface Props {
  src: string;
  mediaType: 'image' | 'video';
  fit?: 'cover' | 'contain';
  transform?: string;
  startFromInFrames?: number;
  muted?: boolean;
  className?: string;
}

function resolveSource(src: string): string {
  const isSelfContained = /^(https?:|data:)/.test(src);
  return isSelfContained ? src : staticFile(src);
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
  const resolvedSource = resolveSource(src);
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
