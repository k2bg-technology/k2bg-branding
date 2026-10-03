import type { Meta, StoryObj } from '@storybook/nextjs';

import jaTranslation from '../i18n/locales/ja/translation.json';

import { ScrollHelper } from './ScrollHelper';

const meta: Meta<typeof ScrollHelper> = {
  component: ScrollHelper,
  args: {
    dictionary: jaTranslation.scrollHelper,
  },
};

export default meta;

type Story = StoryObj<typeof ScrollHelper>;

export const Default: Story = {};
