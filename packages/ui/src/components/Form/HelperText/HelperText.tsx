import { HTMLAttributes } from 'react';

import { FormProps, useFormContext } from '../Control/Context';

export interface Props
  extends HTMLAttributes<HTMLParagraphElement>,
    FormProps {}

export function HelperText(props: React.PropsWithChildren<Props>) {
  const { children, ...rest } = props;

  const { error, disabled } = useFormContext(rest);

  const className = [
    'text-caption leading-none text-base-default',
    error && 'text-error',
    disabled && 'text-neutral-300 cursor-not-allowed',
  ].join(' ');

  return (
    <p {...rest} className={className}>
      {children}
    </p>
  );
}
