'use client';

import { cva } from 'class-variance-authority';
import type React from 'react';
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
  'appearance-none focus-visible:border-ring focus-visible:ring-[3px] border rounded-md px-2 py-3 w-full text-body-r-sm leading-none',
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

export function Input(props: Props) {
  const {
    type = 'text',
    className,
    startAdornment,
    endAdornment,
    'aria-describedby': explicitAriaDescribedBy,
    'aria-invalid': explicitAriaInvalid,
    ...formProps
  } = props;
  const { color, error, disabled, helperTextId, ...rest } =
    useFormContext(formProps);

  return (
    <div className={twMerge('relative', disabled && '[&_i]:bg-neutral-300')}>
      {startAdornment && (
        <div className="absolute top-1/2 left-3 -translate-y-1/2 flex align-middle">
          {startAdornment}
        </div>
      )}
      <input
        {...rest}
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
