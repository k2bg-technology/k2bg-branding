import React, { ButtonHTMLAttributes } from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';

import { twMerge } from '../../utils/extendTailwindMerge';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-button-b-md rounded-md font-bold leading-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:border-opacity-50 hover:bg-opacity-10',
  {
    variants: {
      variant: {
        default: '',
        outline: 'border-2 border-opacity-20',
        ghost: '',
      },
      color: {
        main: '',
        accent: '',
        success: '',
        error: '',
        info: '',
        warning: '',
        dark: '',
        light: '',
        inherit: '',
      },
      size: {
        default: 'px-3 h-8',
        sm: 'rounded-md px-2 h-6',
        lg: 'rounded-md px-4 h-10',
        icon: 'rounded-full w-10 h-10',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        color: 'main',
        class: 'bg-main-default text-white hover:bg-opacity-90',
      },
      {
        variant: 'outline',
        color: 'main',
        class: 'border-main-default text-main-default hover:bg-main-default',
      },
      {
        variant: 'ghost',
        color: 'main',
        class: 'text-main-default hover:bg-main-default',
      },
      {
        variant: 'default',
        color: 'accent',
        class: 'bg-accent-default text-white hover:bg-opacity-90',
      },
      {
        variant: 'outline',
        color: 'accent',
        class:
          'border-accent-default text-accent-default hover:bg-accent-default',
      },
      {
        variant: 'ghost',
        color: 'accent',
        class: 'text-accent-default hover:bg-accent-default',
      },
      {
        variant: 'default',
        color: 'inherit',
        class: 'bg-transparent text-current',
      },
      {
        variant: 'outline',
        color: 'inherit',
        class: 'border-transparent text-current hover:bg-transparent',
      },
      {
        variant: 'ghost',
        color: 'inherit',
        class: 'text-current hover:bg-transparent',
      },
      {
        variant: 'default',
        color: 'error',
        class: 'bg-error text-white hover:bg-opacity-90',
      },
      {
        variant: 'outline',
        color: 'error',
        class: 'border-error text-error hover:bg-error hover:bg-opacity-10',
      },
      {
        variant: 'ghost',
        color: 'error',
        class: 'text-error hover:bg-error hover:bg-opacity-10',
      },
      {
        variant: 'default',
        color: 'warning',
        class: 'bg-warning text-white hover:bg-opacity-90',
      },
      {
        variant: 'outline',
        color: 'warning',
        class:
          'border-warning text-warning hover:bg-warning hover:bg-opacity-10',
      },
      {
        variant: 'ghost',
        color: 'warning',
        class: 'text-warning hover:bg-warning hover:bg-opacity-10',
      },
      {
        variant: 'default',
        color: 'info',
        class: 'bg-info text-white hover:bg-opacity-90',
      },
      {
        variant: 'outline',
        color: 'info',
        class: 'border-info text-info hover:bg-info hover:bg-opacity-10',
      },
      {
        variant: 'ghost',
        color: 'info',
        class: 'text-info hover:bg-info hover:bg-opacity-10',
      },
      {
        variant: 'default',
        color: 'success',
        class: 'bg-success text-white hover:bg-opacity-90',
      },
      {
        variant: 'outline',
        color: 'success',
        class:
          'border-success text-success hover:bg-success hover:bg-opacity-10',
      },
      {
        variant: 'ghost',
        color: 'success',
        class: 'text-success hover:bg-success hover:bg-opacity-10',
      },
      {
        variant: 'default',
        color: 'dark',
        class: 'bg-base-black text-white hover:bg-opacity-90',
      },
      {
        variant: 'outline',
        color: 'dark',
        class:
          'border-base-black text-base-black hover:bg-base-black hover:bg-opacity-10',
      },
      {
        variant: 'ghost',
        color: 'dark',
        class: 'text-base-black hover:bg-base-black hover:bg-opacity-10',
      },
      {
        variant: 'default',
        color: 'light',
        class: 'bg-white text-base-black hover:bg-opacity-90',
      },
      {
        variant: 'outline',
        color: 'light',
        class: 'border-white text-white hover:bg-white hover:bg-opacity-10',
      },
      {
        variant: 'ghost',
        color: 'light',
        class: 'text-white hover:bg-white hover:bg-opacity-10',
      },
    ],
    defaultVariants: {
      variant: 'default',
      color: 'main',
      size: 'default',
    },
  }
);

export interface Props
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ variant, color, size, asChild = false, className, ...rest }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={twMerge(buttonVariants({ variant, color, size }), className)}
        ref={ref}
        {...rest}
      />
    );
  }
);
Button.displayName = 'Button';

export default Button;
