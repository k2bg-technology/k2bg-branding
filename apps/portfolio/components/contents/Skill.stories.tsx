import type { Meta, StoryObj } from '@storybook/nextjs';

import jaTranslation from '../../i18n/locales/ja/translation.json';

import { Skill } from './Skill';

const meta: Meta<typeof Skill> = {
  component: Skill,
  args: {
    dictionary: jaTranslation.skill,
  },
};

export default meta;

type Story = StoryObj<typeof Skill>;

export const Default: Story = {};
