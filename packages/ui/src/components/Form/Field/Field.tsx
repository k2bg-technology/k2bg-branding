import { useId } from 'react';
import { type FieldContextValue, FieldProvider } from './FieldProvider';

interface Props
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color'>,
    FieldContextValue {}

export function Field(props: Props) {
  const { children, ...fieldContextValue } = props;
  const generatedHelperTextId = useId();

  return (
    <FieldProvider helperTextId={generatedHelperTextId} {...fieldContextValue}>
      {children}
    </FieldProvider>
  );
}
