import type { MediaOutput } from '../../modules/media/use-cases';
import { CloudinaryImage } from '../cloudinary-image/CloudinaryImage';

interface MediaImageProps {
  media: MediaOutput;
}

export function MediaImage({ media }: MediaImageProps) {
  if (!media.effectiveSource || media.width == null || media.height == null) {
    return null;
  }

  if (media.targetUrl) {
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
  }

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
