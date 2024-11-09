'use client';

import { ForwardedRef, TextareaHTMLAttributes, forwardRef } from 'react';
import { cva } from 'class-variance-authority';

import { FormProps, useFormContext } from '../Control/Context';
import { twMerge } from '../../../utils/extendTailwindMerge';

const inputVariants = cva(
  'appearance-none focus:outline-none focus:shadow-sm border rounded-md px-2 py-3 w-full text-body-r-sm leading-none',
  {
    variants: {
      color: {
        dark: 'focus:border-base-black border-base-default/50 text-base-default focus:shadow-base-black/30 placeholder-base-default/50',
        light:
          'focus:border-white border-white/50 text-white focus:shadow-white/30 placeholder-white/50',
      },
      error: {
        true: [
          'border-error focus:border-error focus:shadow-error/30 focus:shadow-sm',
        ],
      },
      disabled: {
        true: [
          'border-neutral-300 focus:border-neutral-300 placeholder-neutral-300 cursor-not-allowed',
        ],
      },
    },
    defaultVariants: {
      color: 'dark',
      error: false,
      disabled: false,
    },
  }
);

export interface Props
  extends Omit<
      TextareaHTMLAttributes<HTMLTextAreaElement>,
      'children' | 'color'
    >,
    FormProps {}

const Textarea = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLTextAreaElement>) => {
    const { className, ...rest } = props;

    const { color = 'dark', error, disabled } = useFormContext(rest);

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
);
Textarea.displayName = 'Textarea';

export default Textarea;
