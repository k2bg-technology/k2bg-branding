import type { Meta, StoryObj } from '@storybook/nextjs';

import { CompanyLogo } from './CompanyLogo';

const meta: Meta<typeof CompanyLogo> = {
  title: 'CompanyLogo',
  component: CompanyLogo,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
