import type { Meta, StoryObj } from '@storybook/nextjs';

import { useTranslation } from '../../i18n/client';

import { Background } from './Background';

const meta: Meta<typeof Background> = {
  component: Background,
  render: function Render() {
    const { t } = useTranslation('ja');

    return <Background t={t} />;
  },
};

export default meta;

type Story = StoryObj<typeof Background>;

export const Default: Story = {};
