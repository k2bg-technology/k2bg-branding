'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { Icon } from '../Icon';

export interface PeriodSelectorProps
  extends Omit<ComponentPropsWithoutRef<'fieldset'>, 'children'> {
  /** Current period as display text, already localized by the consuming app. */
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  /** Accessible name of the previous button, already localized. */
  previousLabel: string;
  /** Accessible name of the next button, already localized. */
  nextLabel: string;
}

export function PeriodSelector({
  label,
  onPrevious,
  onNext,
  previousDisabled = false,
  nextDisabled = false,
  previousLabel,
  nextLabel,
  className,
  ...rest
}: PeriodSelectorProps) {
  return (
    <fieldset
      data-slot="period-selector"
      className={cn(
        'inline-flex items-center gap-3 text-base-black',
        className
      )}
      {...rest}
    >
      <Button
        type="button"
        variant="outline"
        color="dark"
        className="size-8 rounded border px-0"
        aria-label={previousLabel}
        disabled={previousDisabled}
        onClick={onPrevious}
      >
        <Icon appearance="solid" name="chevron-left" width={16} height={16} />
      </Button>
      <span
        aria-live="polite"
        className="min-w-[10ch] text-center text-body-r-sm font-medium tabular-nums"
      >
        {label}
      </span>
      <Button
        type="button"
        variant="outline"
        color="dark"
        className="size-8 rounded border px-0"
        aria-label={nextLabel}
        disabled={nextDisabled}
        onClick={onNext}
      >
        <Icon appearance="solid" name="chevron-right" width={16} height={16} />
      </Button>
    </fieldset>
  );
}
