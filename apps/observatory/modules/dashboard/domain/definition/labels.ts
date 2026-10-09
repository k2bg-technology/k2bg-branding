export interface DashboardLabels {
  period: string;
  previousPeriod: string;
  nextPeriod: string;
  truncated: string;
  previousPage: string;
  nextPage: string;
  pagination: string;
  nullCategory: string;
}

export const DEFAULT_DASHBOARD_LABELS = {
  period: 'Period',
  previousPeriod: 'Previous period',
  nextPeriod: 'Next period',
  truncated: 'Older periods are not shown',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  pagination: 'Pagination',
  nullCategory: 'None',
};
