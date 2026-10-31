import { cn } from 'ui';

import styles from './Slider.module.css';

interface Props extends React.ComponentPropsWithoutRef<'div'> {}

export function Slider(props: Props) {
  const { children, className, ...rest } = props;

  return (
    <div {...rest} className={cn(styles.Slider, className)}>
      {children}
    </div>
  );
}
