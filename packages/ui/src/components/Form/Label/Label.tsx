'use client';

import { LabelHTMLAttributes } from 'react';
import { cva } from 'class-variance-authority';

import { FormProps, useFormContext } from '../Control/Context';
import { twMerge } from '../../../utils/extendTailwindMerge';

const labelVariants = cva('text-body-b-sm font-bold', {
  variants: {
    color: {
      dark: 'text-base-black',
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

export interface Props
  extends Omit<LabelHTMLAttributes<HTMLLabelElement>, 'color'>,
    FormProps {}

export function Label(props: React.PropsWithChildren<Props>) {
  const { children, className, ...rest } = props;

  const { color = 'dark', error, disabled } = useFormContext(rest);

  return (
    <label
      {...rest}
      className={twMerge(labelVariants({ color, error, disabled }), className)}
    >
      {children}
    </label>
  );
}
