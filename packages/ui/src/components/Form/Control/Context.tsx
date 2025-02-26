'use client';

import { createContext, use } from 'react';

export interface FormProps {
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  color?: 'dark' | 'light';
}

const FormContext = createContext<FormProps>({
  required: false,
  error: false,
  disabled: false,
  color: 'dark',
});

export function FormProvider({
  children,
  ...formProps
}: React.PropsWithChildren<FormProps>) {
  return <FormContext value={formProps}>{children}</FormContext>;
}

export function useFormContext(formProps?: FormProps) {
  const formContext = use(FormContext);

  return {
    ...formContext,
    ...formProps,
  };
}
