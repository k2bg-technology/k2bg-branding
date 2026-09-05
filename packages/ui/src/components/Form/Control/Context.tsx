'use client';

import { createContext, use } from 'react';

export interface FormProps {
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  color?: 'dark' | 'light';
  /**
   * Id shared by the HelperText and the control's `aria-describedby`.
   * Control generates one via `useId`; pass your own here (not on HelperText)
   * so both sides agree during server rendering.
   */
  helperTextId?: string;
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

export function useFormContext(formProps?: FormProps): FormProps {
  const formContext = use(FormContext);

  return {
    ...formContext,
    ...formProps,
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
