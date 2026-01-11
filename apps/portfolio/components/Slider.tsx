import { twMerge } from 'ui/src/utils/extendTailwindMerge';
import styles from './Slider.module.css';

type Props = React.ComponentPropsWithoutRef<'div'>;

export function Slider(props: Props) {
  const { children, className, ...rest } = props;

  return (
    <div {...rest} className={twMerge(styles.Slider, className)}>
      {children}
    </div>
  );
}
