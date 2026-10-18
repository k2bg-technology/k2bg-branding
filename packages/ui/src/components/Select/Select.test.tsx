import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Select } from '.';

const regions = [
  { value: '', label: 'All regions' },
  { value: 'tokyo', label: 'Tokyo' },
  { value: 'osaka', label: 'Osaka' },
];

describe('Select', () => {
  it('names the trigger with its label', () => {
    render(
      <Select>
        <Select.Label>Region</Select.Label>
        <Select.Trigger />
      </Select>
    );

    expect(
      screen.getByRole('combobox', { name: 'Region' })
    ).toBeInTheDocument();
  });

  it('submits the chosen item value and shows its text in the trigger', async () => {
    const user = userEvent.setup();
    render(
      <form aria-label="Filters">
        <Select name="region" defaultValue="" items={regions}>
          <Select.Label>Region</Select.Label>
          <Select.Trigger placeholder="All regions" />
          <Select.Popup>
            {regions.map((region) => (
              <Select.Item key={region.value} value={region.value}>
                {region.label}
              </Select.Item>
            ))}
          </Select.Popup>
        </Select>
      </form>
    );
    const trigger = screen.getByRole('combobox', { name: 'Region' });

    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'Osaka' }));

    const formData = new FormData(
      screen.getByRole<HTMLFormElement>('form', { name: 'Filters' })
    );
    expect(formData.get('region')).toBe('osaka');
    expect(trigger).toHaveTextContent('Osaka');
  });
});
