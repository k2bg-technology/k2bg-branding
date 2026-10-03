import { useId } from 'react';
import { type FormContextValue, FormProvider } from './Context';

type Props = Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> &
  FormContextValue;

export function Control(props: Props) {
  const { children, ...formContextValue } = props;
  const generatedHelperTextId = useId();

  return (
    <FormProvider helperTextId={generatedHelperTextId} {...formContextValue}>
      {children}
    </FormProvider>
  );
}
