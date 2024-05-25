import { ForwardedRef, InputHTMLAttributes, forwardRef } from 'react';

import { FormProps, useFormContext } from '../Control/Context';

export interface Props
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'children'>,
    FormProps {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

// eslint-disable-next-line react/display-name
const Input = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLInputElement>) => {
    const { type = 'text', startAdornment, endAdornment, ...rest } = props;

    const { error, disabled } = useFormContext(rest);

    const className = [
      'appearance-none focus:outline-none focus:border-info focus:shadow-info/30 focus:shadow-sm focus:border-opacity-80 border-opacity-50 border border-base-default text-base-default rounded-xl px-3 py-4 w-full text-body-r-sm leading-none placeholder-base-default placeholder-opacity-70',
      startAdornment && 'pl-16',
      endAdornment && 'pr-16',
      error &&
        'border-error focus:border-error focus:shadow-error/30 focus:shadow-sm',
      disabled &&
        'border-neutral-300 focus:border-neutral-300 placeholder-neutral-300 cursor-not-allowed',
    ].join(' ');

    return (
      <div className={`relative ${disabled && '[&_i]:bg-neutral-300'}`}>
        {startAdornment && (
          <div className="absolute top-1/2 left-4 -translate-y-1/2 flex align-middle">
            {startAdornment}
          </div>
        )}
        <input
          {...rest}
          ref={ref}
          className={className}
          type={type}
          disabled={disabled}
        />
        {endAdornment && (
          <div className="absolute top-1/2 right-4 -translate-y-1/2 flex align-middle">
            {endAdornment}
          </div>
        )}
      </div>
    );
  }
);

export default Input;
