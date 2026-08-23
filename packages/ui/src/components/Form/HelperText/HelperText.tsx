import { cva } from 'class-variance-authority';
import { twMerge } from '../../../utils/extendTailwindMerge';
import { type FormProps, useFormContext } from '../Control/Context';

// `text-neutral-300` (disabled) is a deliberate exception: no base-* token is
// a visually reasonable match for this disabled-state gray.
const helperTextVariants = cva('text-caption leading-none', {
  variants: {
    color: {
      dark: 'text-base-default',
      light: 'text-base-white',
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

// `id` is owned by Control (`helperTextId`) so the control's
// `aria-describedby` and this element agree in server-rendered HTML.
export type Props = Omit<
  React.ComponentPropsWithoutRef<'span'>,
  'color' | 'id'
> &
  FormProps;

export function HelperText(props: React.PropsWithChildren<Props>) {
  const { children, className, ...formProps } = props;

  const {
    color = 'dark',
    error,
    disabled,
    helperTextId,
    ...rest
  } = useFormContext(formProps);

  return (
    <span
      {...rest}
      id={helperTextId}
      className={twMerge(
        helperTextVariants({ color, error, disabled }),
        className
      )}
    >
      {children}
    </span>
  );
}
