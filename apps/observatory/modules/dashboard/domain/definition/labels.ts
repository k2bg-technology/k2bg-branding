export interface DashboardLabels {
  period: string;
  previousPeriod: string;
  nextPeriod: string;
  truncated: string;
  previousPage: string;
  nextPage: string;
  pagination: string;
  asOf: string;
  accumulatingSince: string;
  availableFrom: string;
  notReady: string;
  nullCategory: string;
  applyControls: string;
}

export const DEFAULT_DASHBOARD_LABELS = {
  period: 'Period',
  previousPeriod: 'Previous period',
  nextPeriod: 'Next period',
  truncated: 'Older periods are not shown',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  pagination: 'Pagination',
  asOf: 'As of',
  accumulatingSince: 'Accumulating since',
  availableFrom: 'Available from',
  notReady: 'The latest data is not ready yet',
  nullCategory: 'None',
  applyControls: 'Apply',
};

export const DEFAULT_CONTROL_ALL_LABEL = 'All';
