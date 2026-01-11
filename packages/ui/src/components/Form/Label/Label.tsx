'use client';

import { cva } from 'class-variance-authority';
import { twMerge } from '../../../utils/extendTailwindMerge';
import { type FormProps, useFormContext } from '../Control/Context';

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
  extends Omit<React.ComponentPropsWithoutRef<'label'>, 'color'>,
    FormProps {}

export function Label(props: Props) {
  const { children, className, ...formProps } = props;

  const {
    color = 'dark',
    error,
    disabled,
    ...rest
  } = useFormContext(formProps);

  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: this label is always used with input
    <label
      {...rest}
      className={twMerge(labelVariants({ color, error, disabled }), className)}
    >
      {children}
    </label>
  );
}
