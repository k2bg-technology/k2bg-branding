import { LabelHTMLAttributes } from 'react';

import { FormProps, useFormContext } from '../Control/Context';

export interface Props
  extends LabelHTMLAttributes<HTMLLabelElement>,
    FormProps {}

export function Label(props: React.PropsWithChildren<Props>) {
  const { children, ...rest } = props;

  const { error, disabled } = useFormContext(rest);

  const className = [
    'text-body-b-sm font-bold leading-none text-base-black',
    error && '!text-error',
    disabled && '!text-neutral-300 cursor-not-allowed',
  ].join(' ');

  return (
    <label {...rest} className={className}>
      {children}
    </label>
  );
}
