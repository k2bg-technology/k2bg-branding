import { ButtonHTMLAttributes, ReactNode } from 'react';

import styles from './Button.module.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode | ReactNode[];
}

export default function Button({ children, ...rest }: Props): JSX.Element {
  return (
    <button
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
      className={styles.Button}
      type="button"
    >
      {children}
    </button>
  );
}
