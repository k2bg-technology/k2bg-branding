import { Slot } from '@radix-ui/react-slot';
import { cva, VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const stack = cva('flex w-full', {
  variants: {
    direction: {
      row: ['flex-row'],
      column: ['flex-col'],
    },
    justifyContent: {
      start: ['justify-start'],
      end: ['justify-end'],
      center: ['justify-center'],
      stretch: ['justify-stretch'],
      between: ['justify-between'],
      around: ['justify-around'],
    },
    alignItems: {
      start: ['items-start'],
      end: ['items-end'],
      center: ['items-center'],
      stretch: ['items-stretch'],
      baseline: ['items-baseline'],
    },
    gap: {
      none: ['gap-0'],
      condensed: ['gap-1'],
      normal: ['gap-2'],
      spacious: ['gap-4'],
    },
    padding: {
      none: ['p-0'],
      condensed: ['p-1'],
      normal: ['p-2'],
      spacious: ['p-4'],
    },
  },
  defaultVariants: {
    gap: 'none',
    padding: 'none',
  },
});

interface Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stack> {
  asChild?: boolean;
}

export default function Stack(props: React.PropsWithChildren<Props>) {
  const {
    children,
    direction = 'row',
    justifyContent = 'stretch',
    alignItems = 'stretch',
    gap = 'none',
    padding = 'none',
    className,
    asChild = false,
    ...rest
  } = props;

  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      {...rest}
      className={twMerge(
        stack({ direction, justifyContent, alignItems, gap, padding }),
        className
      )}
    >
      {children}
    </Comp>
  );
}
