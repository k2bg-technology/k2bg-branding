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

  return (
    <a
      {...rest}
      href={linkUrl}
      target="_blank"
      rel="noopener nofollow"
      className="inline-block"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={linkText}
        src={imageUrl}
        width={imageWidth}
        height={imageHeight}
        data-id={id}
        data-placeholder={imagePlaceholder}
        className="object-contain cursor-pointer"
      />
    </a>
  );
}
