import { twMerge } from 'tailwind-merge';
import styles from './page-layout.module.css';
import type { GridColumn } from './types';

interface ContentProps extends React.ComponentPropsWithRef<'div'> {
  colStart?: GridColumn;
  colEnd?: GridColumn;
}

export function Content({
  colStart,
  colEnd,
  className,
  style,
  children,
  ...rest
}: ContentProps) {
  return (
    <div
      {...rest}
      className={twMerge(
        'col-span-full',
        colStart && styles.colStart,
        colEnd && styles.colEnd,
        className
      )}
      style={{
        ...style,
        ...(colStart && { '--col-start': colStart }),
        ...(colEnd && { '--col-end': colEnd }),
      }}
    >
      {children}
    </div>
  );
}
