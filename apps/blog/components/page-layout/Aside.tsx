import { twMerge } from 'tailwind-merge';
import styles from './page-layout.module.css';
import type { GridColumn } from './types';

interface AsideProps extends React.ComponentPropsWithRef<'aside'> {
  colStart?: GridColumn;
  colEnd?: GridColumn;
}

export function Aside({
  colStart,
  colEnd,
  className,
  style,
  children,
  ...rest
}: AsideProps) {
  return (
    <aside
      {...rest}
      className={twMerge(
        'hidden xl:flex',
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
    </aside>
  );
}
