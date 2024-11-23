import Image, { ImageProps } from 'next/image';

import Cloudinary from '../../modules/data-access/cloudinary';

interface CloudinaryImageProps
  extends Omit<ImageProps, 'src' | 'placeholder' | 'blurDataURL'> {
  publicId: string;
}

export async function CloudinaryImage(props: CloudinaryImageProps) {
  const { publicId, alt, ...rest } = props;

  const optimizedImageUrl = Cloudinary.Fetcher.getImageUrl(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
  });

  const placeholderImageUrl = Cloudinary.Fetcher.getImageUrl(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    effect: 'blur:1000',
    width: '100',
  });

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
