interface BannerPromotionProps {
  linkText: string;
  linkUrl: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
}

export default function BannerPromotion(props: BannerPromotionProps) {
  const { linkText, linkUrl, imageUrl, imageWidth, imageHeight } = props;

  return (
    <a
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
        className="object-contain cursor-pointer"
      />
    </a>
  );
}
