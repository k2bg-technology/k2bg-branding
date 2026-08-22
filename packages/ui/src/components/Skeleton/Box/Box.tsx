import { twMerge } from '../../../utils/extendTailwindMerge';

// `bg-gray-300` is a deliberate exception to the design-token color rule: no
// base-* token is a visually reasonable match (base-light is much lighter,
// base-default/base-dark are much darker/warmer). See packages/ui/src/components/Skelton/Round/Round.tsx
// for the same exception.
type LineProps = React.ComponentPropsWithoutRef<'div'>;

export function Box(props: LineProps) {
  const { children, className = 'py-24' } = props;

  return (
    <div
      {...props}
      className={twMerge(
        'relative flex justify-center align-middle bg-gray-300 rounded-sm',
        className
      )}
    >
      {children && (
        <div className="flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          {children}
        </div>
      )}
    </div>
  );
}
