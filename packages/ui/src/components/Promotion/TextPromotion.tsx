import { HTMLAttributes } from 'react';

interface TextPromotionProps extends HTMLAttributes<HTMLAnchorElement> {
  linkText: string;
  linkUrl: string;
}

export default function TextPromotion(props: TextPromotionProps) {
  const { linkText, linkUrl, ...rest } = props;

  return (
    <a {...rest} href={linkUrl} target="blank" rel="noopener nofollow">
      {linkText}
    </a>
  );
}
