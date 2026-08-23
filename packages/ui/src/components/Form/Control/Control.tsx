import { useId } from 'react';
import { type FormProps, FormProvider } from './Context';

type Props = Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> & FormProps;

export function Control(props: Props) {
  const { children, ...formProps } = props;
  const helperTextId = useId();

  return (
    <FormProvider helperTextId={helperTextId} {...formProps}>
      {children}
    </FormProvider>
  );
}
