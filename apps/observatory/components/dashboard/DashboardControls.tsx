import Form from 'next/form';
import { useId } from 'react';
import { Button, Select } from 'ui';

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
        const allLabel = control.allLabel ?? DEFAULT_CONTROL_ALL_LABEL;
        const items = [
          { value: '', label: allLabel },
          ...options.map((option) => ({ value: option, label: option })),
        ];
        const noteId = `${idPrefix}${control.id}-note`;
        return (
          <div key={control.id} className="flex flex-col gap-condensed">
            <Select
              name={`control.${control.id}`}
              defaultValue={selected ?? ''}
              items={items}
            >
              <Select.Label>{control.label}</Select.Label>
              <Select.Trigger
                placeholder={allLabel}
                aria-describedby={
                  resolved.status === 'unavailable' ? noteId : undefined
                }
                className="min-w-40"
              />
              <Select.Popup>
                {items.map((item) => (
                  <Select.Item key={item.value} value={item.value}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Popup>
            </Select>
            {resolved.status === 'unavailable' && (
              <p id={noteId} className="text-body-r-sm text-base-black/80">
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
