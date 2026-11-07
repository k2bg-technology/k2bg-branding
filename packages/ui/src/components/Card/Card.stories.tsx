import type { Meta, StoryObj } from '@storybook/react-vite';

import { Card } from '.';

const meta = {
  component: Card,
  argTypes: {
    children: { control: false },
  },
  args: { className: 'w-full max-w-md' },
  parameters: {
    docs: {
      description: { component: 'components.card.description' },
      overview: 'components.card.overview',
      usage: 'components.card.usage',
      accessibility: 'components.card.accessibility',
      doList: 'components.card.doList',
      dontList: 'components.card.dontList',
      relatedComponents: 'components.card.relatedComponents',
      dependencies: 'components.card.dependencies',
      references: 'components.card.references',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <Card.Header>
        <Card.Title>
          <h2>Activity</h2>
        </Card.Title>
        <Card.Description>Recent observations at a glance.</Card.Description>
      </Card.Header>
      <Card.Content>Daily activity for the selected period.</Card.Content>
    </Card>
  ),
};
