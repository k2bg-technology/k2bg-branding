interface BannerPromotionProps extends React.ComponentPropsWithoutRef<'a'> {
  linkUrl: string;
  image?: React.ReactNode;
}

export function BannerPromotion(props: BannerPromotionProps) {
  const { linkUrl, image, ...rest } = props;
  props;

  if (!image) {
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
      {image}
    </a>
  );
}
