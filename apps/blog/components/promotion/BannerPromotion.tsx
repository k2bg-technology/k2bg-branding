import { CloudinaryImage } from '../cloudinary-image/CloudinaryImage';

interface BannerPromotionProps extends React.ComponentPropsWithoutRef<'a'> {
  linkText: string;
  linkUrl: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  imagePlaceholder?: string;
}

export default function BannerPromotion(props: BannerPromotionProps) {
  const {
    id,
    linkText,
    linkUrl,
    imageUrl,
    imageWidth,
    imageHeight,
    imagePlaceholder,
    ...rest
  } = props;

  if (!id) {
    return null;
  }

  return (
    <a
      {...rest}
      href={linkUrl}
      target="_blank"
      rel="noopener nofollow"
      className="inline-block"
    >
      <CloudinaryImage
        publicId={id}
        className="object-contain cursor-pointer"
        src={imageUrl}
        alt={linkText}
        width={Number(imageWidth)}
        height={Number(imageHeight)}
      />
    </a>
  );
}
