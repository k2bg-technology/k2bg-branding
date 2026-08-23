'use client';

import { cva } from 'class-variance-authority';
import { useEffect } from 'react';
import { twMerge } from '../../../utils/extendTailwindMerge';
import {
  type FormProps,
  useFormContext,
  useRegisterHelperTextId,
} from '../Control/Context';

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

export type Props = Omit<React.ComponentPropsWithoutRef<'span'>, 'color'> &
  FormProps;

export function HelperText(props: React.PropsWithChildren<Props>) {
  const { children, className, id: explicitId, ...formProps } = props;

  const {
    color = 'dark',
    error,
    disabled,
    helperTextId,
    ...rest
  } = useFormContext(formProps);
  const registerHelperTextId = useRegisterHelperTextId();

  useEffect(() => {
    if (explicitId === undefined) {
      return;
    }
    registerHelperTextId?.(explicitId);
    return () => registerHelperTextId?.(undefined);
  }, [explicitId, registerHelperTextId]);

  return (
    <span
      {...rest}
      id={explicitId ?? helperTextId}
      className={twMerge(
        helperTextVariants({ color, error, disabled }),
        className
      )}
    >
      {children}
    </span>
  );
}
