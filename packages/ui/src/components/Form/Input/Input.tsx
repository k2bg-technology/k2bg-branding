'use client';

import React from 'react';
import { cva } from 'class-variance-authority';

import { FormProps, useFormContext } from '../Control/Context';
import { twMerge } from '../../../utils/extendTailwindMerge';

const inputVariants = cva(
  'appearance-none focus:outline-hidden focus:shadow-xs border rounded-md px-2 py-3 w-full text-body-r-sm leading-none',
  {
    variants: {
      color: {
        dark: 'focus:border-base-black/50 border-base-default/50 text-base-default focus:shadow-base-black/10 placeholder-base-default/50',
        light:
          'focus:border-white border-white/50 text-white focus:shadow-white/30 placeholder-white/50',
      },
      error: {
        true: [
          'border-error focus:border-error focus:shadow-error/30 focus:shadow-xs',
        ],
      },
      disabled: {
        true: [
          'border-neutral-300 focus:border-neutral-300 placeholder-neutral-300 cursor-not-allowed',
        ],
      },
      hasStartAdornment: {
        true: ['pl-10'],
      },
      hasEndAdornment: {
        true: ['pr-10'],
      },
    },
    defaultVariants: {
      color: 'dark',
      error: false,
      disabled: false,
      hasStartAdornment: false,
      hasEndAdornment: false,
    },
  }
);

export interface Props
  extends Omit<React.ComponentPropsWithRef<'input'>, 'children' | 'color'>,
    FormProps {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export default function Input(props: Props) {
  const {
    type = 'text',
    className,
    startAdornment,
    endAdornment,
    ...formProps
  } = props;
  const { color, error, disabled, ...rest } = useFormContext(formProps);

  return (
    <div className={twMerge('relative', disabled && '[&_i]:bg-neutral-300')}>
      {startAdornment && (
        <div className="absolute top-1/2 left-3 -translate-y-1/2 flex align-middle">
          {startAdornment}
        </div>
      )}
      <input
        {...rest}
        className={twMerge(
          inputVariants({
            color,
            error,
            disabled,
            hasStartAdornment: !!startAdornment,
            hasEndAdornment: !!endAdornment,
          }),
          className
        )}
        type={type}
        disabled={disabled}
      />
      {endAdornment && (
        <div className="absolute top-1/2 right-3 -translate-y-1/2 flex align-middle">
          {endAdornment}
        </div>
      )}
    </div>
  );
}
