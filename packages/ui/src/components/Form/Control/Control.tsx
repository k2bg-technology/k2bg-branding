import { FormProps, FormProvider } from './Context';

type Props = Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> & FormProps;

export default function Control(props: Props) {
  const { children, ...formProps } = props;

  return <FormProvider {...formProps}>{children}</FormProvider>;
}
