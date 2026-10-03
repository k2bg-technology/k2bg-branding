'use client';

import { cva } from 'class-variance-authority';
import { twMerge } from '../../../utils/extendTailwindMerge';
import {
  type FormProps,
  resolveAriaDescribedBy,
  resolveAriaInvalid,
  useFormContext,
} from '../Control/Context';

// `neutral-300` (disabled) is a deliberate exception: no base-* token is a
// visually reasonable match for this disabled-state gray.
const inputVariants = cva(
  'appearance-none focus-visible:border-ring focus-visible:ring-[3px] border rounded-md px-2 py-3 w-full min-h-[3lh] max-h-[10lh] text-body-r-sm field-sizing-content',
  {
    variants: {
      color: {
        dark: 'focus-visible:ring-base-default/30 border-base-default/50 text-base-default placeholder-base-default/50',
        light:
          'focus-visible:ring-base-white/30 border-base-white/50 text-base-white placeholder-base-white/50',
      },
      error: {
        true: ['border-error focus-visible:ring-error/30'],
      },
      disabled: {
        true: ['border-neutral-300 placeholder-neutral-300 cursor-not-allowed'],
      },
    },
    defaultVariants: {
      color: 'dark',
      error: false,
      disabled: false,
    },
  }
);

interface Props
  extends Omit<React.ComponentPropsWithRef<'textarea'>, 'children' | 'color'>,
    FormProps {}

export function Textarea(props: Props) {
  const {
    className,
    ref,
    'aria-describedby': explicitAriaDescribedBy,
    'aria-invalid': explicitAriaInvalid,
    ...formProps
  } = props;

  const {
    color = 'dark',
    error,
    disabled,
    helperTextId,
    ...rest
  } = useFormContext(formProps);

  return (
    <textarea
      {...rest}
      ref={ref}
      aria-invalid={resolveAriaInvalid(explicitAriaInvalid, error)}
      aria-describedby={resolveAriaDescribedBy(
        explicitAriaDescribedBy,
        error ? helperTextId : undefined
      )}
      className={twMerge(
        inputVariants({
          color,
          error,
          disabled,
        }),
        className
      )}
      disabled={disabled}
    />
  );
}
