type TextPromotionProps = React.ComponentPropsWithoutRef<'a'>;

export default function TextPromotion(props: TextPromotionProps) {
  const { children, ...rest } = props;

  return (
    <a {...rest} target="blank" rel="noopener nofollow">
      {children}
    </a>
  );
}
