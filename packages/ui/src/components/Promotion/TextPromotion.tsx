import { AnchorHTMLAttributes } from 'react';

interface TextPromotionProps extends AnchorHTMLAttributes<HTMLAnchorElement> {}

export default function TextPromotion(props: TextPromotionProps) {
  const { children, ...rest } = props;

  return (
    <a {...rest} target="blank" rel="noopener nofollow">
      {children}
    </a>
  );
}
