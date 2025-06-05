import Image, { ImageProps } from 'next/image';

import * as Cloudinary from '../../modules/data-access/cloudinary';

interface CloudinaryImageProps
  extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  publicId: string;
}

export async function CloudinaryImage(props: CloudinaryImageProps) {
  const { publicId, alt, ...rest } = props;

  const imageRepository = new Cloudinary.Repository();

  const version = await imageRepository.fetchImageVersion(publicId);
  const optimizedImageUrl = imageRepository.getOptimizedImageUrl(
    publicId,
    version
  );
  const placeholderImageUrl = imageRepository.getPlaceholderImageUrl(
    publicId,
    version
  );
  const placeholderImageBase64 = await fetch(placeholderImageUrl).then(
    async (res) =>
      `data:image/webp;base64,${Buffer.from(await res.arrayBuffer()).toString(
        'base64'
      )}`
  );

  return (
    <Image
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
      src={optimizedImageUrl}
      alt={alt}
      placeholder="blur"
      blurDataURL={placeholderImageBase64}
    />
  );
}
