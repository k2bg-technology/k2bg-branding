'use client';

import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { cn } from '../../utils/cn';
import { Button, buttonVariants } from '../Button';
import { Icon, type IconProps } from '../Icon';

export interface PeriodSelectorProps
  extends Omit<ComponentPropsWithoutRef<'fieldset'>, 'children'> {
  /** Current period as display text, already localized by the consuming app. */
  label: string;
  /** Action of the previous step; without it and `previousHref` the step is disabled. */
  onPrevious?: () => void;
  /** Action of the next step; without it and `nextHref` the step is disabled. */
  onNext?: () => void;
  /** URL of the previous period; renders that control as a link. */
  previousHref?: string;
  /** URL of the next period; renders that control as a link. */
  nextHref?: string;
  /** Element the href form renders, e.g. the app router's link component. */
  linkComponent?: ElementType;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  /** Accessible name of the previous button, already localized. */
  previousLabel: string;
  /** Accessible name of the next button, already localized. */
  nextLabel: string;
}

const stepClassName = 'size-8 rounded border px-0';

interface PeriodStepProps {
  label: string;
  iconName: IconProps['name'];
  href?: string;
  linkComponent: ElementType;
  disabled: boolean;
  onActivate?: () => void;
}

// A control that cannot act is a disabled button, never a link, so it stays
// unfocusable and unfollowable: at a bound, while the whole fieldset is
// disabled, and when the step has neither a URL nor a handler to act with.
// The link applies `buttonVariants` directly because Base UI's Button replaces
// link semantics with `role="button"` on a non-button render target.
function PeriodStep({
  label,
  iconName,
  href,
  linkComponent: Link,
  disabled,
  onActivate,
}: PeriodStepProps) {
  const icon = (
    <Icon appearance="solid" name={iconName} width={16} height={16} />
  );
  const isDisabled =
    disabled || (href === undefined && onActivate === undefined);

  if (href !== undefined && !isDisabled) {
    return (
      <Link
        href={href}
        aria-label={label}
        className={cn(
          buttonVariants({ variant: 'outline', color: 'dark' }),
          stepClassName
        )}
        onClick={onActivate}
      >
        {icon}
      </Link>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      color="dark"
      className={stepClassName}
      aria-label={label}
      disabled={isDisabled}
      onClick={onActivate}
    >
      {icon}
    </Button>
  );
}

export function PeriodSelector({
  label,
  onPrevious,
  onNext,
  previousHref,
  nextHref,
  linkComponent = 'a',
  disabled = false,
  previousDisabled = false,
  nextDisabled = false,
  previousLabel,
  nextLabel,
  className,
  ...rest
}: PeriodSelectorProps) {
  return (
    // A disabled fieldset disables descendant form controls but not anchors, so
    // each step is told about it rather than relying on the fieldset alone.
    <fieldset
      data-slot="period-selector"
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-3 text-base-black',
        className
      )}
      {...rest}
    >
      <PeriodStep
        label={previousLabel}
        iconName="chevron-left"
        href={previousHref}
        linkComponent={linkComponent}
        disabled={disabled || previousDisabled}
        onActivate={onPrevious}
      />
      <span
        aria-live="polite"
        className="min-w-[10ch] text-center text-body-r-sm font-medium tabular-nums"
      >
        {label}
      </span>
      <PeriodStep
        label={nextLabel}
        iconName="chevron-right"
        href={nextHref}
        linkComponent={linkComponent}
        disabled={disabled || nextDisabled}
        onActivate={onNext}
      />
    </fieldset>
  );
}
