import { useRender } from '@base-ui/react/use-render';

import { cn } from '../../utils/cn';
import { Button, buttonVariants } from '../Button';

type Props = React.ComponentPropsWithoutRef<typeof Button>;

// Base UI's Button gives a non-<button> render element role="button", so a
// page link is rendered outside it to keep its link semantics.
export function Control({
  render,
  variant,
  color,
  size,
  className,
  ...rest
}: Props) {
  const link = useRender({
    render,
    enabled: render !== undefined,
    state: { disabled: rest.disabled ?? false },
    props: {
      ...rest,
      className: cn(buttonVariants({ variant, color, size }), className),
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
      />
    )
  );
}
