import type { Meta, StoryObj } from '@storybook/nextjs';

import jaTranslation from '../../i18n/locales/ja/translation.json';

import { Hero } from './Hero';

const meta: Meta<typeof Hero> = {
  component: Hero,
  args: {
    dictionary: jaTranslation.hero,
  },
};

export default meta;

type Story = StoryObj<typeof Hero>;

export const Default: Story = {};
