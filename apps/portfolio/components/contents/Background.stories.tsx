import type { Meta, StoryObj } from '@storybook/nextjs';

import jaTranslation from '../../i18n/locales/ja/translation.json';

import { Background } from './Background';

const meta: Meta<typeof Background> = {
  component: Background,
  args: {
    dictionary: jaTranslation.background,
  },
};

export default meta;

type Story = StoryObj<typeof Background>;

export const Default: Story = {};
