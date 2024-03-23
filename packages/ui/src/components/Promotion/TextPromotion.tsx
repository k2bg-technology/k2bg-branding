interface TextPromotionProps {
  linkText: string;
  linkUrl: string;
}

export default function TextPromotion(props: TextPromotionProps) {
  const { linkText, linkUrl } = props;

  return (
    <a href={linkUrl} target="blank" rel="noopener nofollow">
      {linkText}
    </a>
  );
}
