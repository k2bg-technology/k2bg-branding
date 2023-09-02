import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

import styles from './Button.module.css';

export default function Button({
  children,
  className,
  ...rest
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
      className={`${styles.Button} ${className}`}
      type="button"
    >
      {children}
    </button>
  );
}
