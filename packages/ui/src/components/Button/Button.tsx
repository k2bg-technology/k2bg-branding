import { cva, VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';

import { twMerge } from '../../utils/extendTailwindMerge';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-button-b-md rounded-md font-bold leading-none focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 transition duration-300 ease-in-out',
  {
    variants: {
      variant: {
        default: '',
        outline: 'border-2',
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
        class: 'bg-main-default text-white hover:bg-main-default/90',
      },
      {
        variant: 'outline',
        color: 'main',
        class:
          'border-main-default/20 text-main-default hover:bg-main-default/10',
      },
      {
        variant: 'ghost',
        color: 'main',
        class: 'text-main-default hover:bg-main-default/10',
      },
      {
        variant: 'default',
        color: 'accent',
        class: 'bg-accent-default text-white hover:bg-accent-default/90',
      },
      {
        variant: 'outline',
        color: 'accent',
        class:
          'border-accent-default/20 text-accent-default hover:bg-accent-default/10',
      },
      {
        variant: 'ghost',
        color: 'accent',
        class: 'text-accent-default hover:bg-accent-default/10',
      },
      {
        variant: 'default',
        color: 'inherit',
        class: 'bg-transparent text-current',
      },
      {
        variant: 'outline',
        color: 'inherit',
        class: 'border-transparent/20 text-current hover:bg-transparent',
      },
      {
        variant: 'ghost',
        color: 'inherit',
        class: 'text-current hover:bg-transparent',
      },
      {
        variant: 'default',
        color: 'error',
        class: 'bg-error text-white hover:bg-error/90',
      },
      {
        variant: 'outline',
        color: 'error',
        class: 'border-error/20 text-error hover:bg-error/10',
      },
      {
        variant: 'ghost',
        color: 'error',
        class: 'text-error hover:bg-error/10',
      },
      {
        variant: 'default',
        color: 'warning',
        class: 'bg-warning text-white hover:bg-warning/90',
      },
      {
        variant: 'outline',
        color: 'warning',
        class: 'border-warning/20 text-warning hover:bg-warning/10',
      },
      {
        variant: 'ghost',
        color: 'warning',
        class: 'text-warning hover:bg-warning/10',
      },
      {
        variant: 'default',
        color: 'info',
        class: 'bg-info text-white hover:bg-info/90',
      },
      {
        variant: 'outline',
        color: 'info',
        class: 'border-info/20 text-info hover:bg-info/10',
      },
      {
        variant: 'ghost',
        color: 'info',
        class: 'text-info hover:bg-info/10',
      },
      {
        variant: 'default',
        color: 'success',
        class: 'bg-success text-white hover:bg-success/90',
      },
      {
        variant: 'outline',
        color: 'success',
        class: 'border-success/20 text-success hover:bg-success/10',
      },
      {
        variant: 'ghost',
        color: 'success',
        class: 'text-success hover:bg-success/10',
      },
      {
        variant: 'default',
        color: 'dark',
        class: 'bg-base-black text-white hover:bg-base-black/90',
      },
      {
        variant: 'outline',
        color: 'dark',
        class: 'border-base-black/20 text-base-black hover:bg-base-black/10',
      },
      {
        variant: 'ghost',
        color: 'dark',
        class: 'text-base-black hover:bg-base-black/10',
      },
      {
        variant: 'default',
        color: 'light',
        class: 'bg-white text-base-black hover:bg-white/90',
      },
      {
        variant: 'outline',
        color: 'light',
        class: 'border-white/20 text-white hover:bg-white/10',
      },
      {
        variant: 'ghost',
        color: 'light',
        class: 'text-white hover:bg-white/10',
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
  extends Omit<React.ComponentPropsWithRef<'button'>, 'color'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export default function Button({
  variant,
  color,
  size,
  asChild = false,
  className,
  ...rest
}: Props) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={twMerge(buttonVariants({ variant, color, size }), className)}
      {...rest}
    />
  );
}

Button.displayName = 'Button';
