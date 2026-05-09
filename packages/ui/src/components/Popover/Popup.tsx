'use client';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const variants = cva(
  'rounded-md border p-spacious shadow-md outline-none data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95 data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95',
  {
    variants: {
      color: {
        light: 'bg-white border-base-default/20 text-base-black',
        dark: 'bg-base-black border-base-black/50 text-white',
      },
    },
    defaultVariants: {
      color: 'light',
    },
  }
);

type Props = PopoverPrimitive.Popup.Props & VariantProps<typeof variants>;

export function Popup({ children, className, color, ...rest }: Props) {
  return (
    <PopoverPrimitive.Popup
      {...rest}
      className={cn(variants({ color }), className)}
    >
      {children}
    </PopoverPrimitive.Popup>
  );
}
