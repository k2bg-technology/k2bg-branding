import { cn } from '../../utils/cn';

const CORNER_CLASS_NAMES = {
  'top-left': 'top-0 left-0',
  'top-right': 'top-0 right-0',
  'bottom-left': 'bottom-0 left-0',
  'bottom-right': 'bottom-0 right-0',
} as const;

interface Props {
  corner?: keyof typeof CORNER_CLASS_NAMES;
  opacity?: number;
  className?: string;
}

export function Logo({
  corner = 'top-right',
  opacity = 0.9,
  className,
}: Props) {
  return (
    <p
      className={cn(
        'absolute font-original font-bold text-base-white',
        CORNER_CLASS_NAMES[corner],
        className
      )}
      style={{ fontSize: 36, opacity }}
    >
      K2BG
    </p>
  );
}
