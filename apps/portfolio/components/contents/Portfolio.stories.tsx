import type { Meta, StoryObj } from '@storybook/nextjs';

import { useTranslation } from '../../i18n/client';

import { Portfolio } from './Portfolio';

const meta: Meta<typeof Portfolio> = {
  component: Portfolio,
  render: function Render() {
    const { t } = useTranslation('ja');

    return <Portfolio t={t} />;
  },
};

export default meta;

type Story = StoryObj<typeof Portfolio>;

export const Default: Story = {};
