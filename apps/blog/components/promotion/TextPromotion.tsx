interface Props extends React.ComponentPropsWithoutRef<'a'> {}

export function TextPromotion(props: Props) {
  const { children, ...rest } = props;

  return (
    <a {...rest} target="blank" rel="noopener nofollow">
      {children}
    </a>
  );
}
