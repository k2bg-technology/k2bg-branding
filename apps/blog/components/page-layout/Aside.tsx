import { cn } from 'ui';
import styles from './page-layout.module.css';
import type { GridColumn } from './types';

interface Props extends React.ComponentPropsWithRef<'aside'> {
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
}: Props) {
  return (
    <aside
      {...rest}
      className={cn(
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
