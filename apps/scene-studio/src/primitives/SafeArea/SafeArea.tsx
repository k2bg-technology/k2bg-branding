import type { ReactNode } from 'react';

import { SAFE_AREA_INSETS, type SafeAreaInsets } from '../../tokens/safeArea';
import { cn } from '../../utils/cn';

interface Props {
  children: ReactNode;
  insets?: SafeAreaInsets;
  showGuides?: boolean;
  className?: string;
}

export function SafeArea({
  children,
  insets = SAFE_AREA_INSETS,
  showGuides = false,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'absolute',
        showGuides && 'border-2 border-dashed border-main-default',
        className
      )}
      style={{
        top: insets.top,
        right: insets.right,
        bottom: insets.bottom,
        left: insets.left,
      }}
    >
      {children}
    </div>
  );
}
