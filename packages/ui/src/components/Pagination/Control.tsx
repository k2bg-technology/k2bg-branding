import { useRender } from '@base-ui/react/use-render';

import { cn } from '../../utils/cn';
import { Button, buttonVariants } from '../Button';

type Props = React.ComponentPropsWithoutRef<typeof Button>;

export function Control({
  render,
  variant,
  color,
  size,
  className,
  style,
  nativeButton: _nativeButton,
  focusableWhenDisabled,
  ...rest
}: Props) {
  const linkState = { disabled: false };
  const link = useRender({
    render,
    enabled: render !== undefined && !rest.disabled,
    state: linkState,
    props: {
      ...rest,
      className: cn(buttonVariants({ variant, color, size }), className),
      style: typeof style === 'function' ? style(linkState) : style,
    },
  });

  return (
    link ?? (
      <Button
        {...rest}
        type="button"
        variant={variant}
        color={color}
        size={size}
        className={className}
        style={style}
        focusableWhenDisabled={focusableWhenDisabled}
      />
    )
  );
}
