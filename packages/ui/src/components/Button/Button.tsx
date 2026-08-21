import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

/**
 * Exported standalone so button styling can be applied to non-`<button>`
 * elements (e.g. `<a>`, `next/link`'s `Link`). Mirrors shadcn/ui's pattern.
 *
 * @see https://ui.shadcn.com/docs/components/button
 * @see https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/button.tsx
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-button-b-md rounded-md font-bold leading-none cursor-pointer focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 ease-in-out',
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
        class: 'bg-main-default text-base-white hover:bg-main-default/90',
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
        class: 'bg-accent-default text-base-white hover:bg-accent-default/90',
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
        class: 'bg-error text-base-white hover:bg-error/90',
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
        class: 'bg-warning text-base-white hover:bg-warning/90',
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
        class: 'bg-info text-base-white hover:bg-info/90',
      },
      {
        variant: 'outline',
        color: 'info',
        class: 'border-info/20 text-info hover:bg-info/10',
      },
      {
        variant: 'ghost',
        color: 'info',
        class: 'text-info hover:bg-info hover:text-info/10',
      },
      {
        variant: 'default',
        color: 'success',
        class: 'bg-success text-base-white hover:bg-success/90',
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
        class: 'bg-base-black text-base-white hover:bg-base-black/90',
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
        class: 'bg-base-white text-base-black hover:bg-base-white/90',
      },
      {
        variant: 'outline',
        color: 'light',
        class: 'border-base-white/20 text-base-white hover:bg-base-white/10',
      },
      {
        variant: 'ghost',
        color: 'light',
        class: 'text-base-white hover:bg-base-white/10',
      },
    ],
    defaultVariants: {
      variant: 'default',
      color: 'main',
      size: 'default',
    },
  }
);

export type Props = Omit<ButtonPrimitive.Props, 'color'> &
  VariantProps<typeof buttonVariants>;

export function Button({
  variant,
  color,
  size,
  className,
  render,
  children,
  ...rest
}: Props) {
  return (
    <ButtonPrimitive
      className={cn(buttonVariants({ variant, color, size }), className)}
      render={render}
      {...rest}
    >
      {children}
    </ButtonPrimitive>
  );
}

Button.displayName = 'Button';
