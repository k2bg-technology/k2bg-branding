import type { Meta, StoryObj } from '@storybook/nextjs';

import { useTranslation } from '../../i18n/client';

import { Skill } from './Skill';

const meta: Meta<typeof Skill> = {
  component: Skill,
  render: function Render() {
    const { t } = useTranslation('ja');

    return <Skill t={t} />;
  },
};

export default meta;

type Story = StoryObj<typeof Skill>;

export const Default: Story = {};
