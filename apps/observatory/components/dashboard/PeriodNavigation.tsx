'use client';

import Link from 'next/link';
import { PeriodSelector } from 'ui';

import type { DashboardLabels } from '../../modules/dashboard/domain';

interface Props {
  label: string;
  labels: DashboardLabels;
  previousHref?: string;
  nextHref?: string;
}

export function PeriodNavigation({
  label,
  labels,
  previousHref,
  nextHref,
}: Props) {
  return (
    <PeriodSelector
      label={label}
      linkComponent={Link}
      previousHref={previousHref}
      nextHref={nextHref}
      previousLabel={labels.previousPeriod}
      nextLabel={labels.nextPeriod}
      aria-label={labels.period}
    />
  );
}
