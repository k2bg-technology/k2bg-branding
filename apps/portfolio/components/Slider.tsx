import styles from './Slider.module.css';

type Props = React.HTMLAttributes<HTMLDivElement> & React.PropsWithChildren;

export function Slider(props: Props) {
  const { children, ...rest } = props;

  return (
    <div {...rest} className={styles.Slider}>
      {children}
    </div>
  );
}
