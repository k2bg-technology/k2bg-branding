'use client';

import { cva } from 'class-variance-authority';
import { twMerge } from '../../../utils/extendTailwindMerge';
import { type FormProps, useFormContext } from '../Control/Context';

const inputVariants = cva(
  'appearance-none focus-visible:border-ring focus-visible:ring-[3px] border rounded-md px-2 py-3 w-full text-body-r-sm field-sizing-content',
  {
    variants: {
      color: {
        dark: 'focus-visible:ring-base-default/30 border-base-default/50 text-base-default placeholder-base-default/50',
        light:
          'focus-visible:ring-white/30 border-white/50 text-white placeholder-white/50',
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

export default function Textarea(props: Props) {
  const { className, ref, ...formProps } = props;

  const {
    color = 'dark',
    error,
    disabled,
    ...rest
  } = useFormContext(formProps);

  return (
    <textarea
      {...rest}
      ref={ref}
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
