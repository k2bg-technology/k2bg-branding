import { HTMLAttributes, PropsWithChildren } from 'react';

import { FormProps, FormProvider } from './Context';

interface Props
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>,
    FormProps {}

export default function Control(props: PropsWithChildren<Props>) {
  const { children, ...formProps } = props;

  return <FormProvider {...formProps}>{children}</FormProvider>;
}
