import { type FormProps, FormProvider } from './Context';

type Props = Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> & FormProps;

export function Control(props: Props) {
  const { children, ...formProps } = props;

  return <FormProvider {...formProps}>{children}</FormProvider>;
}
