'use client';

import { useId, useState } from 'react';
import { type FormProps, FormProvider } from './Context';

type Props = Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> & FormProps;

export function Control(props: Props) {
  const { children, ...formProps } = props;
  const generatedHelperTextId = useId();
  const [explicitHelperTextId, setExplicitHelperTextId] = useState<string>();

  return (
    <FormProvider
      helperTextId={explicitHelperTextId ?? generatedHelperTextId}
      registerHelperTextId={setExplicitHelperTextId}
      {...formProps}
    >
      {children}
    </FormProvider>
  );
}
