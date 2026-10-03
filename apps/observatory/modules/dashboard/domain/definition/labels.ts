export interface DashboardLabels {
  period: string;
  previousPeriod: string;
  nextPeriod: string;
  truncated: string;
}

export const DEFAULT_DASHBOARD_LABELS = {
  period: 'Period',
  previousPeriod: 'Previous period',
  nextPeriod: 'Next period',
  truncated: 'Older periods are not shown',
};
