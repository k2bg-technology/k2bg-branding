import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import { Select } from '.';

const regions = [
  { value: 'tokyo', label: 'Tokyo' },
  { value: 'osaka', label: 'Osaka' },
  { value: 'nagoya', label: 'Nagoya' },
  { value: 'fukuoka', label: 'Fukuoka' },
];

const regionsWithAll = [{ value: '', label: 'All regions' }, ...regions];

const accounts = Array.from({ length: 30 }, (_, index) => ({
  value: `account-${index + 1}`,
  label: `Account ${index + 1}`,
}));

const meta = {
  component: Select,
  argTypes: {
    children: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component: 'components.select.description',
      },
      overview: 'components.select.overview',
      usage: 'components.select.usage',
      accessibility: 'components.select.accessibility',
      doList: 'components.select.doList',
      dontList: 'components.select.dontList',
      relatedComponents: 'components.select.relatedComponents',
      dependencies: 'components.select.dependencies',
      references: 'components.select.references',
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'region',
    defaultValue: 'tokyo',
    items: regions,
    children: (
      <div className="flex flex-col gap-condensed">
        <Select.Label>Region</Select.Label>
        <Select.Trigger className="w-48" />
        <Select.Popup>
          {regions.map((region) => (
            <Select.Item key={region.value} value={region.value}>
              {region.label}
            </Select.Item>
          ))}
        </Select.Popup>
      </div>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox', { name: 'Region' });

    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(
        within(document.body).getByRole('option', { name: 'Tokyo' })
      ).toBeVisible()
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');

    await waitFor(() => expect(trigger).toHaveTextContent('Osaka'));
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveFocus();
  },
};

export const WithPlaceholder: Story = {
  args: {
    name: 'region',
    defaultValue: '',
    items: regionsWithAll,
    children: (
      <div className="flex flex-col gap-condensed">
        <Select.Label>Region</Select.Label>
        <Select.Trigger className="w-48" placeholder="All regions" />
        <Select.Popup>
          {regionsWithAll.map((region) => (
            <Select.Item key={region.value} value={region.value}>
              {region.label}
            </Select.Item>
          ))}
        </Select.Popup>
      </div>
    ),
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('combobox', { name: 'Region' })
    ).toHaveTextContent('All regions');
  },
};

export const LongList: Story = {
  args: {
    name: 'account',
    defaultValue: 'account-1',
    items: accounts,
    children: (
      <div className="flex flex-col gap-condensed">
        <Select.Label>Account</Select.Label>
        <Select.Trigger className="w-48" />
        <Select.Popup>
          {accounts.map((account) => (
            <Select.Item key={account.value} value={account.value}>
              {account.label}
            </Select.Item>
          ))}
        </Select.Popup>
      </div>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: 'Account' }));

    await waitFor(() =>
      expect(within(document.body).getByRole('listbox')).toBeVisible()
    );
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('combobox', { name: 'Region' })
    ).toBeDisabled();
  },
};
