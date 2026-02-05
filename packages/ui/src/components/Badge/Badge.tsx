import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default: 'border-transparent',
        outline: '',
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
    },
    compoundVariants: [
      {
        variant: 'default',
        color: 'main',
        class: 'bg-main-default text-white',
      },
      {
        variant: 'outline',
        color: 'main',
        class: 'border-main-default/20 text-main-default',
      },
      {
        variant: 'default',
        color: 'accent',
        class: 'bg-accent-default text-white',
      },
      {
        variant: 'outline',
        color: 'accent',
        class: 'border-accent-default/20 text-accent-default',
      },
      {
        variant: 'default',
        color: 'inherit',
        class: 'bg-transparent text-current',
      },
      {
        variant: 'outline',
        color: 'inherit',
        class: 'border-transparent/20 text-current',
      },
      {
        variant: 'default',
        color: 'error',
        class: 'bg-error text-white',
      },
      {
        variant: 'outline',
        color: 'error',
        class: 'border-error/20 text-error',
      },
      {
        variant: 'default',
        color: 'warning',
        class: 'bg-warning text-white',
      },
      {
        variant: 'outline',
        color: 'warning',
        class: 'border-warning/20 text-warning',
      },
      {
        variant: 'default',
        color: 'info',
        class: 'bg-info text-white',
      },
      {
        variant: 'outline',
        color: 'info',
        class: 'border-info/20 text-info',
      },
      {
        variant: 'default',
        color: 'success',
        class: 'bg-success text-white',
      },
      {
        variant: 'outline',
        color: 'success',
        class: 'border-success/20 text-success',
      },
      {
        variant: 'default',
        color: 'dark',
        class: 'bg-base-black text-white',
      },
      {
        variant: 'outline',
        color: 'dark',
        class: 'border-base-black/20 text-base-black',
      },
      {
        variant: 'default',
        color: 'light',
        class: 'bg-white text-base-black',
      },
      {
        variant: 'outline',
        color: 'light',
        class: 'border-white/20 text-white',
      },
    ],
    defaultVariants: {
      variant: 'default',
      color: 'main',
    },
  }
);

export function Badge({
  className,
  variant,
  color,
  asChild = false,
  ...rest
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      className={twMerge(badgeVariants({ variant, color }), className)}
      {...rest}
    />
  );
}
