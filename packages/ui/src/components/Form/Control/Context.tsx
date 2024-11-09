'use client';

import { createContext, useContext } from 'react';

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
}: FormProps & React.PropsWithChildren) {
  return (
    <FormContext.Provider value={formProps}>{children}</FormContext.Provider>
  );
}

export function useFormContext(formProps?: FormProps) {
  const formContext = useContext(FormContext);

  return {
    ...formContext,
    ...formProps,
  };
}
