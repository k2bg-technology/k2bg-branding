import Form from 'next/form';
import { useId } from 'react';
import { Button, Form as UiForm } from 'ui';

import {
  type DashboardDefinition,
  DEFAULT_CONTROL_ALL_LABEL,
  DEFAULT_DASHBOARD_LABELS,
  type ResolvedControlOptionsById,
  selectControlOptions,
  serializeUrlState,
  type UrlState,
} from '../../modules/dashboard/domain';

interface Props {
  dashboard: DashboardDefinition;
  state: UrlState;
  controlOptions: ResolvedControlOptionsById;
}

export function DashboardControls({ dashboard, state, controlOptions }: Props) {
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
      {dashboard.controls.map((control) => {
        const resolved = selectControlOptions(control, controlOptions);
        const selected = state.controls[control.id];
        const options =
          resolved.status === 'ready'
            ? resolved.options
            : [selected].filter(
                (value): value is string => value !== undefined
              );
        const selectId = `${idPrefix}${control.id}`;
        return (
          <div key={control.id} className="flex flex-col gap-condensed">
            <UiForm.Label htmlFor={selectId}>{control.label}</UiForm.Label>
            <select
              id={selectId}
              name={`control.${control.id}`}
              defaultValue={selected ?? ''}
              aria-describedby={
                resolved.status === 'unavailable'
                  ? `${selectId}-note`
                  : undefined
              }
              className="h-8 rounded-md border border-base-default/50 bg-base-white px-2 text-base-default text-body-r-sm focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-base-default/30"
            >
              <option value="">
                {control.allLabel ?? DEFAULT_CONTROL_ALL_LABEL}
              </option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {resolved.status === 'unavailable' && (
              <p
                id={`${selectId}-note`}
                className="text-body-r-sm text-base-black/80"
              >
                {labels.controlOptionsUnavailable}
              </p>
            )}
          </div>
        );
      })}
      {state.foreign.map(({ key, value }) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <Button type="submit">{labels.applyControls}</Button>
    </Form>
  );
}
