import { InputHTMLAttributes, PropsWithChildren } from 'react';

import styles from './Button.module.css';

export default function InputButton({
  className,
  ...rest
}: PropsWithChildren<InputHTMLAttributes<HTMLInputElement>>) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <input {...rest} className={`${styles.Button} ${className}`} />
  );
}
