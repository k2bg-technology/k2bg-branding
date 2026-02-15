import { twMerge } from 'tailwind-merge';
import styles from './page-layout.module.css';
import type { GapSize } from './types';

interface RowProps extends React.ComponentPropsWithRef<'div'> {
  gap?: GapSize;
}

export function Row({ gap, className, style, children, ...rest }: RowProps) {
  return (
    <div
      {...rest}
      className={twMerge(
        'col-span-full grid grid-cols-[subgrid]',
        gap && styles.gap,
        className
      )}
      style={{
        ...style,
        ...(gap && { '--gap': gap }),
      }}
    >
      {children}
    </div>
  );
}
