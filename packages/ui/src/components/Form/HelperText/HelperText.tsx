import { cva } from 'class-variance-authority';

import { FormProps, useFormContext } from '../Control/Context';
import { twMerge } from '../../../utils/extendTailwindMerge';

const helperTextVariants = cva('text-caption leading-none', {
  variants: {
    color: {
      dark: 'text-base-default',
      light: 'text-white',
    },
    error: {
      true: ['text-error'],
    },
    disabled: {
      true: ['text-neutral-300 cursor-not-allowed'],
    },
  },
  defaultVariants: {
    color: 'dark',
    error: false,
    disabled: false,
  },
});

export type Props = Omit<React.ComponentPropsWithoutRef<'span'>, 'color'> &
  FormProps;

export function HelperText(props: React.PropsWithChildren<Props>) {
  const { children, className, ...rest } = props;

  const { color = 'dark', error, disabled } = useFormContext(rest);

  return (
    <span
      {...rest}
      className={twMerge(
        helperTextVariants({ color, error, disabled }),
        className
      )}
    >
      {children}
    </span>
  );
}
