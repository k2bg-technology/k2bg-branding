import { HTMLAttributes, PropsWithChildren } from 'react';

import { FormProps, FormProvider } from './Context';

interface Props extends HTMLAttributes<HTMLDivElement>, FormProps {}

export default function Control(props: PropsWithChildren<Props>) {
  const { children, ...formProps } = props;

  return <FormProvider {...formProps}>{children}</FormProvider>;
}
