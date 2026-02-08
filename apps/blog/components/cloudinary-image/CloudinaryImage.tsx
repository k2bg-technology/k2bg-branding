import Image, { type ImageProps } from 'next/image';
import { Icon, Skelton } from 'ui';

import {
  getOptimizedImageUrl,
  getPlaceholderImageUrl,
} from '../../infrastructure/cloudinary';

interface CloudinaryImageProps
  extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  publicId: string;
}

export async function CloudinaryImage(props: CloudinaryImageProps) {
  const { publicId, alt, ...rest } = props;

  try {
    const optimizedImageUrl = getOptimizedImageUrl(publicId);
    const placeholderImageUrl = getPlaceholderImageUrl(publicId);
    const placeholderImageBase64 = await fetch(placeholderImageUrl).then(
      async (res) =>
        `data:image/webp;base64,${Buffer.from(await res.arrayBuffer()).toString(
          'base64'
        )}`
    );

    return (
      <Image
        {...rest}
        src={optimizedImageUrl}
        alt={alt}
        placeholder="blur"
        blurDataURL={placeholderImageBase64}
      />
    );
  } catch {
    return (
      <Skelton className="w-full h-full">
        <Skelton.Box className="w-full h-full">
          <Icon
            name="photo"
            color="var(--color-base-white)"
            width={30}
            height={30}
          />
        </Skelton.Box>
      </Skelton>
    );
  }
}
