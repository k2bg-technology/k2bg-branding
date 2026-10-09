import Form from 'next/form';
import { useId } from 'react';
import { Button, Form as UiForm } from 'ui';

import {
  type DashboardDefinition,
  DEFAULT_CONTROL_ALL_LABEL,
  DEFAULT_DASHBOARD_LABELS,
  serializeUrlState,
  type UrlState,
} from '../../modules/dashboard/domain';

interface Props {
  dashboard: DashboardDefinition;
  state: UrlState;
}

export function DashboardControls({ dashboard, state }: Props) {
  const idPrefix = useId();
  if (dashboard.controls === undefined) {
    return null;
  }
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };
  return (
    <Form
      key={serializeUrlState(state)}
      action={`/dashboards/${dashboard.id}`}
      className="flex flex-wrap items-end gap-normal"
    >
      {state.period !== null && (
        <input type="hidden" name="period" value={state.period.toString()} />
      )}
      {dashboard.controls.map((control) => (
        <div key={control.id} className="flex flex-col gap-condensed">
          <UiForm.Label htmlFor={`${idPrefix}${control.id}`}>
            {control.label}
          </UiForm.Label>
          <select
            id={`${idPrefix}${control.id}`}
            name={`control.${control.id}`}
            defaultValue={state.controls[control.id] ?? ''}
            className="h-8 rounded-md border border-base-default/50 bg-base-white px-2 text-base-default text-body-r-sm focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-base-default/30"
          >
            <option value="">
              {control.allLabel ?? DEFAULT_CONTROL_ALL_LABEL}
            </option>
            {control.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ))}
      {state.foreign.map(({ key, value }) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <Button type="submit">{labels.applyControls}</Button>
    </Form>
  );
}
