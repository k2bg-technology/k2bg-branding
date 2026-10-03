'use client';

import { createContext, use } from 'react';

export interface FormProps {
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  color?: 'dark' | 'light';
}

/**
 * Only Control can keep the HelperText id and the control's
 * `aria-describedby` in sync, so the id lives in the context alone.
 */
export interface FormContextValue extends FormProps {
  helperTextId?: string;
}

const FormContext = createContext<FormContextValue>({
  required: false,
  error: false,
  disabled: false,
  color: 'dark',
});

export function FormProvider({
  children,
  ...formContextValue
}: React.PropsWithChildren<FormContextValue>) {
  return <FormContext value={formContextValue}>{children}</FormContext>;
}

export function useFormContext(formProps?: FormProps): FormContextValue {
  const { helperTextId, ...formContext } = use(FormContext);

  return {
    ...formContext,
    ...formProps,
    helperTextId,
  };
}

/** Keeps a consumer-provided `aria-invalid` over the `error`-derived one. */
export function resolveAriaInvalid(
  explicitAriaInvalid: React.AriaAttributes['aria-invalid'],
  error: boolean | undefined
): React.AriaAttributes['aria-invalid'] {
  return explicitAriaInvalid ?? (error ? true : undefined);
}

/** Combines a consumer-provided `aria-describedby` with the HelperText id. */
export function resolveAriaDescribedBy(
  explicitAriaDescribedBy: string | undefined,
  helperTextId: string | undefined
): string | undefined {
  return (
    [explicitAriaDescribedBy, helperTextId].filter(Boolean).join(' ') ||
    undefined
  );
}
