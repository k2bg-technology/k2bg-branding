import type {
  DashboardDefinition,
  ValueFormat,
} from '../../modules/dashboard/domain';

export const NULL_VALUE = '—';

interface ValueDisplay {
  format: ValueFormat;
  unit?: string;
}

function numberFormatOptions(
  display: ValueDisplay,
  dashboard: Pick<DashboardDefinition, 'currency'>
): Intl.NumberFormatOptions {
  if (display.format.type === 'currency') {
    return { style: 'currency', currency: dashboard.currency };
  }
  if (display.format.type === 'percent') {
    return { style: 'percent' };
  }
  return {};
}

function formatDuration(
  value: number,
  inputUnit: 'seconds' | 'minutes' | 'hours',
  locale: string,
  signDisplay: Intl.NumberFormatOptions['signDisplay']
): string {
  const minutesPerUnit = { seconds: 1 / 60, minutes: 1, hours: 60 };
  const roundedMinutes =
    Math.sign(value) * Math.round(Math.abs(value * minutesPerUnit[inputUnit]));
  const hours = Math.floor(Math.abs(roundedMinutes) / 60);
  const minutes = Math.abs(roundedMinutes) % 60;
  const firstUnit = hours > 0 ? 'hour' : 'minute';
  const firstValue =
    (hours > 0 ? hours : minutes) * (roundedMinutes < 0 ? -1 : 1);
  const firstPart = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: firstUnit,
    unitDisplay: 'short',
    signDisplay,
  }).format(firstValue);
  if (hours === 0 || minutes === 0) {
    return firstPart;
  }
  const secondPart = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'minute',
    unitDisplay: 'short',
  }).format(minutes);
  return `${firstPart} ${secondPart}`;
}

export function formatValue(
  value: number,
  display: ValueDisplay,
  dashboard: Pick<DashboardDefinition, 'locale' | 'currency'>,
  signDisplay: Intl.NumberFormatOptions['signDisplay'] = 'auto'
): string {
  if (display.format.type === 'duration') {
    const formatted = formatDuration(
      value,
      display.format.inputUnit,
      dashboard.locale,
      signDisplay
    );
    return display.unit === undefined
      ? formatted
      : `${formatted} ${display.unit}`;
  }
  const options = { ...numberFormatOptions(display, dashboard), signDisplay };
  const scaledValue =
    display.format.type === 'percent' && display.format.inputScale === 'percent'
      ? value / 100
      : value;
  const formatted = new Intl.NumberFormat(dashboard.locale, options).format(
    scaledValue
  );
  return display.unit === undefined
    ? formatted
    : `${formatted} ${display.unit}`;
}
